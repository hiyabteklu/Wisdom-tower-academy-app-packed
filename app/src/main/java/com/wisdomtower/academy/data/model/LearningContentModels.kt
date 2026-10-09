package com.wisdomtower.academy.data.model

data class LearningResourceItem(
    val id: String,
    val packageId: String,
    val scopePath: String,
    val hub: String,
    val title: String,
    val chapter: Int? = null,
    val sortOrder: Int = 0,
    val contentType: String? = null,
    val storagePath: String? = null,
    val bodyMd: String? = null,
    val published: Boolean = true
)
