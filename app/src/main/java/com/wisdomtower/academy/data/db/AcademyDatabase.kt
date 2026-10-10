package com.wisdomtower.academy.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        PackageEntity::class,
        CourseEntity::class,
        LearningResourceEntity::class,
        StudyNoteEntity::class,
        StudyGoalEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AcademyDatabase : RoomDatabase() {
    abstract fun packageDao(): PackageDao
    abstract fun courseDao(): CourseDao
    abstract fun learningResourceDao(): LearningResourceDao
    abstract fun studyNoteDao(): StudyNoteDao
    abstract fun studyGoalDao(): StudyGoalDao

    companion object {
        @Volatile
        private var INSTANCE: AcademyDatabase? = null

        fun getInstance(context: Context): AcademyDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AcademyDatabase::class.java,
                    "wisdom_tower_academy.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
