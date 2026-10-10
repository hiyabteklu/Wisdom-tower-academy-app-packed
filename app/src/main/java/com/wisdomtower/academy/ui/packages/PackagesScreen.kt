package com.wisdomtower.academy.ui.packages

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material3.ripple
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomModernCard

/**
 * Packages tab matching website reference:
 * - src/app/packages/page.tsx
 * - src/components/PackagesCatalog.tsx
 *
 * Title: "Academy packages"
 * 3 Section headings: "Grades 9–12", "Other branches", "Special packages"
 * Cards: Image (16:9), Title (pkg.name), "Start Learning" button with MenuBook icon.
 * Zero search boxes, zero filter chips, zero card descriptions, zero "Explore" buttons.
 */
@Composable
fun PackagesScreen(
    modifier: Modifier = Modifier,
    packageList: List<NativePackage> = CATALOG_PACKAGES,
    onSelectPackage: (NativePackage) -> Unit,
    onNavigateToUrl: (String) -> Unit
) {
    val grades = remember(packageList) { packageList.filter { it.group == "grades" } }
    val branches = remember(packageList) { packageList.filter { it.group == "branch" } }
    val specials = remember(packageList) { packageList.filter { it.group == "special" } }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Title Header
            item(key = "packages_title_header") {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Academy packages",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )
                }
            }

            // Section 1: Grades 9–12
            if (grades.isNotEmpty()) {
                item(key = "section_grades_heading") {
                    Text(
                        text = "Grades 9–12",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                    )
                }

                items(
                    count = (grades.size + 1) / 2,
                    key = { rowIndex -> "grades_row_$rowIndex" }
                ) { rowIndex ->
                    val first = grades[rowIndex * 2]
                    val second = grades.getOrNull(rowIndex * 2 + 1)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            PackageCatalogCard(
                                pkg = first,
                                onClick = { onSelectPackage(first) }
                            )
                        }
                        if (second != null) {
                            Box(modifier = Modifier.weight(1f)) {
                                PackageCatalogCard(
                                    pkg = second,
                                    onClick = { onSelectPackage(second) }
                                )
                            }
                        } else {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }

            // Section 2: Other branches
            if (branches.isNotEmpty()) {
                item(key = "section_branches_heading") {
                    Text(
                        text = "Other branches",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(top = 24.dp, bottom = 4.dp)
                    )
                }

                items(
                    count = (branches.size + 1) / 2,
                    key = { rowIndex -> "branches_row_$rowIndex" }
                ) { rowIndex ->
                    val first = branches[rowIndex * 2]
                    val second = branches.getOrNull(rowIndex * 2 + 1)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            PackageCatalogCard(
                                pkg = first,
                                onClick = { onSelectPackage(first) }
                            )
                        }
                        if (second != null) {
                            Box(modifier = Modifier.weight(1f)) {
                                PackageCatalogCard(
                                    pkg = second,
                                    onClick = { onSelectPackage(second) }
                                )
                            }
                        } else {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }

            // Section 3: Special packages
            if (specials.isNotEmpty()) {
                item(key = "section_specials_heading") {
                    Text(
                        text = "Special packages",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(top = 24.dp, bottom = 4.dp)
                    )
                }

                items(
                    count = (specials.size + 1) / 2,
                    key = { rowIndex -> "specials_row_$rowIndex" }
                ) { rowIndex ->
                    val first = specials[rowIndex * 2]
                    val second = specials.getOrNull(rowIndex * 2 + 1)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            PackageCatalogCard(
                                pkg = first,
                                onClick = { onSelectPackage(first) }
                            )
                        }
                        if (second != null) {
                            Box(modifier = Modifier.weight(1f)) {
                                PackageCatalogCard(
                                    pkg = second,
                                    onClick = { onSelectPackage(second) }
                                )
                            }
                        } else {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }

            // Bottom space above bottom nav
            item(key = "packages_bottom_spacer") {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

/**
 * Clean Package Catalog Card strictly mirroring website:
 * <article className="card-modern group flex flex-col h-full justify-between shadow-lg shadow-black/25 overflow-hidden rounded-xl sm:rounded-2xl">
 *   <div className="card-media-wrap aspect-video"><img src={pkg.image} alt={pkg.name} /></div>
 *   <h2>{pkg.name}</h2>
 *   <button className="btn-open"><BookOpen />Start Learning</button>
 * </article>
 */
@Composable
fun PackageCatalogCard(
    pkg: NativePackage,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        onClick = onClick
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // 16:9 Image banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .background(WisdomDark)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(pkg.assetImage)
                        .crossfade(true)
                        .build(),
                    contentDescription = pkg.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            // Card Body: Name + Start Learning button only
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 12.dp)
            ) {
                Text(
                    text = pkg.name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Start Learning action button (btn-open style)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(WisdomCyan.copy(alpha = 0.12f))
                        .border(
                            BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.45f)),
                            RoundedCornerShape(10.dp)
                        )
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = ripple(color = WisdomCyan.copy(alpha = 0.25f)),
                            onClick = onClick
                        )
                        .padding(vertical = 8.dp, horizontal = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.MenuBook,
                            contentDescription = null,
                            tint = WisdomCyan,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Start Learning",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WisdomCyan
                        )
                    }
                }
            }
        }
    }
}
