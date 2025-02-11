'use strict'
import { join } from 'node:path/posix'

import { PATH_SEP } from '../constant/fsConstants.js'
import {
  MASTER_DETAIL_TAG,
  OBJECT_META_XML_SUFFIX,
} from '../constant/metadataConstants.js'
import { readPathFromGit } from '../utils/fsHelper.js'

import DecomposedHandler from './decomposedHandler.js'

export default class CustomFieldHandler extends DecomposedHandler {
  public override async handleAddition() {
    await super.handleAddition()
    if (!this.config.generateDelta) return
    await this._copyParentObject()
  }

  // QUESTION: Why we need to add parent object for Master Detail field ? https://help.salesforce.com/s/articleView?id=000386883&type=1
  protected async _copyParentObject() {
    const data = await readPathFromGit(
      { path: this.line, oid: this.config.to },
      this.config
    )
    if (!data.includes(MASTER_DETAIL_TAG)) return

    const customObjectDirPath = this.splittedLine
      .slice(0, this.splittedLine.indexOf(this.metadataDef.directoryName))
      .join(PATH_SEP)
    const customObjectName =
      this.splittedLine[
        this.splittedLine.indexOf(this.metadataDef.directoryName) - 1
      ]

    const customObjectPath = join(
      customObjectDirPath,
      `${customObjectName}.${OBJECT_META_XML_SUFFIX}`
    )

    await this._copyWithMetaFile(customObjectPath)
  }
}
