/* @flow */
/** @jsx etch.dom */

import etch from 'etch'
import DOMListener from 'dom-listener'
import {CompositeDisposable} from 'atom'

import type {Position} from './diff-selection'
import type HunkLine from './hunk-line'

type HunkLineComponentProps = {hunkLine: HunkLine, fileIndex: number, hunkIndex: number, lineIndex: number, selected: boolean, mouseDownAction: Function, mouseUpAction: Function, mouseMovedAction: Function}

export default class HunkLineComponent {
  hunkLine: HunkLine;
  selected: boolean;
  fileIndex: number;
  hunkIndex: number;
  lineIndex: number;
  element: HTMLElement;
  listener: DOMListener;
  subscriptions: CompositeDisposable;

  constructor (props: HunkLineComponentProps) {
    this.subscriptions = new CompositeDisposable()

    this.acceptProps(props)
  }

  acceptProps ({hunkLine, fileIndex, hunkIndex, lineIndex, selected, mouseDownAction, mouseUpAction, mouseMovedAction}: HunkLineComponentProps): Promise<void> {
    this.hunkLine = hunkLine
    this.selected = selected

    this.fileIndex = fileIndex
    this.hunkIndex = hunkIndex
    this.lineIndex = lineIndex

    this.subscriptions.dispose()
    this.subscriptions.add(this.hunkLine.onDidChange(() => etch.update(this)))

    let updatePromise = Promise.resolve()
    if (this.element) {
      updatePromise = etch.update(this)
    } else {
      etch.initialize(this)
      this.listener = new DOMListener(this.element)
    }

    this.subscriptions.add(this.listener.add(this.element, 'mousedown', e => mouseDownAction(this, e)))
    this.subscriptions.add(this.listener.add(this.element, 'mousemove', e => mouseMovedAction(this, e)))
    this.subscriptions.add(this.listener.add(this.element, 'mouseup', e => mouseUpAction(this, e)))

    return updatePromise
  }

  getPosition (): Position {
    return [this.fileIndex, this.hunkIndex, this.lineIndex]
  }

  render () {
    let additionOrDeletion = ''
    if (this.hunkLine.isAddition()) {
      additionOrDeletion = 'addition'
    } else if (this.hunkLine.isDeletion()) {
      additionOrDeletion = 'deletion'
    }

    let selected = this.selected ? 'selected' : ''
    let staged = this.hunkLine.isStaged() ? 'staged' : ''

    return (
      <div className={`git-hunk-line ${additionOrDeletion} ${selected} ${staged}`}>
        <div className='old-line-number'>
          {this.hunkLine.getOldLineNumber() || ''}
        </div>
        <div className='new-line-number'>
          {this.hunkLine.getNewLineNumber() || ''}
        </div>
        <div className='diff-hunk-data'>
          {this.hunkLine.getLineOrigin()}
          {this.hunkLine.getContent()}
        </div>
      </div>
    )
  }

  update (props: HunkLineComponentProps, children: Array<any>): Promise<void> {
    return this.acceptProps(props)
  }
}