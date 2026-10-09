package com.wisdomtower.academy.data.model

data class DynamicCatalogItem(
    val id: String,
    val name: String,
    val shortName: String,
    val description: String,
    val priceEtb: Int,
    val href: String,
    val image: String,
    val includes: List<String> = emptyList(),
    val enrolledLabel: String = "",
    val groupKey: String = "branch",
    val active: Boolean = true,
    val sortOrder: Int = 100
)

data class EnrolledPackageRecord(
    val packageId: String,
    val packageName: String,
    val source: String = "active",
    val isFreeAccess: Boolean = true
)
