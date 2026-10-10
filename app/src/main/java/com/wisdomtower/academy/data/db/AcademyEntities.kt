package com.wisdomtower.academy.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "packages")
data class PackageEntity(
    @PrimaryKey val id: String,
    val name: String,
    val shortName: String,
    val description: String,
    val path: String,
    val image: String,
    val enrolledLabel: String,
    val group: String,
    val sortOrder: Int
)

@Entity(tableName = "courses")
data class CourseEntity(
    @PrimaryKey val id: String,
    val packageId: String,
    val semesterId: String?,
    val name: String,
    val code: String?,
    val description: String,
    val image: String,
    val path: String,
    val sortOrder: Int
)

@Entity(tableName = "learning_resources")
data class LearningResourceEntity(
    @PrimaryKey val id: String,
    val packageId: String,
    val scopePath: String,
    val hub: String, // "books" | "short-notes" | "flashcards" | "question-banks" | "exams" | "life-savers"
    val title: String,
    val chapter: Int?,
    val sortOrder: Int,
    val contentType: String, // "pdf" | "markdown" | "flashcard_deck" | "quiz" | "exam" | "video_url"
    val storagePath: String?,
    val bodyMd: String?,
    val metaJson: String?,
    val published: Boolean,
    val isDownloaded: Boolean = false,
    val localFilePath: String? = null
)

@Entity(tableName = "study_notes")
data class StudyNoteEntity(
    @PrimaryKey val id: String,
    val folderId: String,
    val folderName: String,
    val title: String,
    val content: String,
    val updatedAt: Long
)

@Entity(tableName = "study_goals")
data class StudyGoalEntity(
    @PrimaryKey val id: String,
    val text: String,
    val completed: Boolean,
    val priority: String, // "high" | "medium" | "low"
    val createdAt: Long
)
