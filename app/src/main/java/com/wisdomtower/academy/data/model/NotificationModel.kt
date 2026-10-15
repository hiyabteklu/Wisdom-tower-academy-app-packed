package com.wisdomtower.academy.data.model

/** One piece of text inside a block. No markdown: bold and highlight are plain flags. */
data class NotificationRun(
    val text: String,
    val bold: Boolean = false,
    val highlight: Boolean = false
)

/** Structured content written by the admin composer (metadata.content.blocks, v1). */
sealed interface NotificationBlock {
    data class Title(val text: String) : NotificationBlock
    data class Subtitle(val text: String) : NotificationBlock
    data class Paragraph(val runs: List<NotificationRun>) : NotificationBlock
    data class Callout(val runs: List<NotificationRun>) : NotificationBlock
    data class Bullets(val items: List<List<NotificationRun>>) : NotificationBlock
    data object Divider : NotificationBlock
}

/** The only three categories (owner order 2026-10-15). Old types general/payment count as ADMIN. */
enum class NotificationCategory { ADMIN, MATERIAL, CONTEST }

data class NativeNotificationItem(
    val id: String,
    val title: String,
    val body: String,
    val type: String = "general",
    val target: String = "all",
    val url: String = "/learning",
    val createdAt: String = "",
    val read: Boolean = false,
    /** Empty for every row that exists today; the reader then falls back to title + body. */
    val content: List<NotificationBlock> = emptyList()
) {
    val category: NotificationCategory
        get() = when (type.trim().lowercase()) {
            "material" -> NotificationCategory.MATERIAL
            "contest" -> NotificationCategory.CONTEST
            else -> NotificationCategory.ADMIN
        }
}
