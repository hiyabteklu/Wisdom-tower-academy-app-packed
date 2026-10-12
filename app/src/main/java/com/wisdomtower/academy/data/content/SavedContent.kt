package com.wisdomtower.academy.data.content

import android.content.Context
import java.io.File

/**
 * Removes what "Download" saved on the phone (F4b, 2026-10-12): a book's PDF file, or the saved full row
 * (note text, flashcards, questions) of any other item. The file name rule is the same as in
 * [LearningContentRepository] (`content_cache/item_<id>.json`; an id is a UUID, so the name needs no cleaning).
 * Reading progress and "last page" are NOT touched. Never throws.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object SavedContent {
    fun delete(context: Context, item: LearningResource) {
        if (item.contentType == "pdf") {
            BookFileStore.delete(context, item.id)
        } else {
            runCatching {
                File(File(context.filesDir, "content_cache"), "item_${item.id}.json").delete()
            }
        }
    }
}
