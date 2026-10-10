package com.wisdomtower.academy.data.db

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader

object DatabaseInitializer {
    private const val TAG = "DatabaseInitializer"

    suspend fun initializeIfNeeded(context: Context) = withContext(Dispatchers.IO) {
        try {
            val db = AcademyDatabase.getInstance(context)
            val packageCount = db.packageDao().count()
            if (packageCount > 0) {
                Log.d(TAG, "Database already initialized with $packageCount packages.")
                return@withContext
            }

            Log.d(TAG, "Initializing database from catalog_snapshot.json asset...")
            val assetManager = context.assets
            val inputStream = assetManager.open("data/catalog_snapshot.json")
            val reader = BufferedReader(InputStreamReader(inputStream))
            val jsonString = reader.use { it.readText() }
            val root = JSONObject(jsonString)

            // Packages
            val packagesArray = root.getJSONArray("packages")
            val packageEntities = mutableListOf<PackageEntity>()
            for (i in 0 until packagesArray.length()) {
                val obj = packagesArray.getJSONObject(i)
                packageEntities.add(
                    PackageEntity(
                        id = obj.getString("id"),
                        name = obj.getString("name"),
                        shortName = obj.optString("shortName", ""),
                        description = obj.optString("description", ""),
                        path = obj.optString("path", ""),
                        image = obj.optString("image", ""),
                        enrolledLabel = obj.optString("enrolledLabel", ""),
                        group = obj.optString("group", "branch"),
                        sortOrder = obj.optInt("sortOrder", i)
                    )
                )
            }
            db.packageDao().insertPackages(packageEntities)

            // Courses
            val coursesArray = root.getJSONArray("courses")
            val courseEntities = mutableListOf<CourseEntity>()
            for (i in 0 until coursesArray.length()) {
                val obj = coursesArray.getJSONObject(i)
                courseEntities.add(
                    CourseEntity(
                        id = obj.getString("id"),
                        packageId = obj.getString("packageId"),
                        semesterId = if (obj.has("semesterId") && !obj.isNull("semesterId")) obj.getString("semesterId") else null,
                        name = obj.getString("name"),
                        code = if (obj.has("code") && !obj.isNull("code")) obj.getString("code") else null,
                        description = obj.optString("description", ""),
                        image = obj.optString("image", ""),
                        path = obj.optString("path", ""),
                        sortOrder = obj.optInt("sortOrder", i)
                    )
                )
            }
            db.courseDao().insertCourses(courseEntities)

            // Learning Resources
            if (root.has("learning_resources")) {
                val resArray = root.getJSONArray("learning_resources")
                val resEntities = mutableListOf<LearningResourceEntity>()
                for (i in 0 until resArray.length()) {
                    val obj = resArray.getJSONObject(i)
                    resEntities.add(
                        LearningResourceEntity(
                            id = obj.getString("id"),
                            packageId = obj.getString("packageId"),
                            scopePath = obj.getString("scopePath"),
                            hub = obj.getString("hub"),
                            title = obj.getString("title"),
                            chapter = if (obj.has("chapter") && !obj.isNull("chapter")) obj.getInt("chapter") else null,
                            sortOrder = obj.optInt("sortOrder", i),
                            contentType = obj.getString("contentType"),
                            storagePath = if (obj.has("storagePath") && !obj.isNull("storagePath")) obj.getString("storagePath") else null,
                            bodyMd = if (obj.has("bodyMd") && !obj.isNull("bodyMd")) obj.getString("bodyMd") else null,
                            metaJson = if (obj.has("metaJson") && !obj.isNull("metaJson")) obj.getString("metaJson") else null,
                            published = obj.optBoolean("published", true),
                            isDownloaded = false,
                            localFilePath = null
                        )
                    )
                }
                db.learningResourceDao().insertResources(resEntities)
            }

            Log.d(TAG, "Database successfully pre-populated from snapshot!")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing database from snapshot", e)
        }
    }
}
