package com.wisdomtower.academy.data.model

data class NativeNotificationItem(
    val id: String,
    val title: String,
    val body: String,
    val type: String = "general",
    val target: String = "all",
    val url: String = "/learning",
    val createdAt: String = "",
    val read: Boolean = false
)
