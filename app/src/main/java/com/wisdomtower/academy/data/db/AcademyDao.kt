package com.wisdomtower.academy.data.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface PackageDao {
    @Query("SELECT * FROM packages ORDER BY sortOrder ASC")
    fun getAllPackages(): Flow<List<PackageEntity>>

    @Query("SELECT * FROM packages WHERE id = :id LIMIT 1")
    suspend fun getPackageById(id: String): PackageEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPackages(packages: List<PackageEntity>)

    @Query("SELECT COUNT(*) FROM packages")
    suspend fun count(): Int
}

@Dao
interface CourseDao {
    @Query("SELECT * FROM courses WHERE packageId = :packageId ORDER BY sortOrder ASC")
    fun getCoursesForPackage(packageId: String): Flow<List<CourseEntity>>

    @Query("SELECT * FROM courses WHERE packageId = :packageId AND (:semesterId IS NULL OR semesterId = :semesterId) ORDER BY sortOrder ASC")
    fun getCoursesForPackageAndSemester(packageId: String, semesterId: String?): Flow<List<CourseEntity>>

    @Query("SELECT * FROM courses WHERE id = :id LIMIT 1")
    suspend fun getCourseById(id: String): CourseEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCourses(courses: List<CourseEntity>)

    @Query("SELECT COUNT(*) FROM courses")
    suspend fun count(): Int
}

@Dao
interface LearningResourceDao {
    @Query("SELECT * FROM learning_resources WHERE scopePath = :scopePath AND hub = :hub AND published = 1 ORDER BY sortOrder ASC")
    fun getResourcesByScopeAndHub(scopePath: String, hub: String): Flow<List<LearningResourceEntity>>

    @Query("SELECT * FROM learning_resources WHERE scopePath = :scopePath AND published = 1 ORDER BY sortOrder ASC")
    fun getResourcesByScope(scopePath: String): Flow<List<LearningResourceEntity>>

    @Query("SELECT * FROM learning_resources WHERE id = :id LIMIT 1")
    suspend fun getResourceById(id: String): LearningResourceEntity?

    @Query("UPDATE learning_resources SET isDownloaded = :downloaded, localFilePath = :path WHERE id = :id")
    suspend fun updateDownloadStatus(id: String, downloaded: Boolean, path: String?)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertResources(resources: List<LearningResourceEntity>)

    @Query("SELECT COUNT(*) FROM learning_resources")
    suspend fun count(): Int
}

@Dao
interface StudyNoteDao {
    @Query("SELECT * FROM study_notes ORDER BY updatedAt DESC")
    fun getAllNotes(): Flow<List<StudyNoteEntity>>

    @Query("SELECT * FROM study_notes WHERE folderId = :folderId ORDER BY updatedAt DESC")
    fun getNotesByFolder(folderId: String): Flow<List<StudyNoteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: StudyNoteEntity)

    @Delete
    suspend fun deleteNote(note: StudyNoteEntity)
}

@Dao
interface StudyGoalDao {
    @Query("SELECT * FROM study_goals ORDER BY createdAt DESC")
    fun getAllGoals(): Flow<List<StudyGoalEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGoal(goal: StudyGoalEntity)

    @Update
    suspend fun updateGoal(goal: StudyGoalEntity)

    @Delete
    suspend fun deleteGoal(goal: StudyGoalEntity)
}
