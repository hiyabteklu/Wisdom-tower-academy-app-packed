package com.wisdomtower.academy.ui.study

import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import android.util.LruCache
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.content.BookFileStore
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomMuted
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException

/**
 * Native book reader (plan step N4): downloads the PDF once (kept on the phone, so it opens offline later),
 * then draws the pages with Android's built-in `PdfRenderer`, one after the other, scrolling down.
 * Texts "Could not load this PDF." comes from the website's `HubContentView`.
 *
 * Not done yet (later steps): pinch zoom, remembering the last page / saving progress to `learning_progress`.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
@Composable
fun PdfReaderScreen(
    title: String,
    url: String?,
    cacheKey: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var progress by remember { mutableStateOf<Float?>(null) }
    var file by remember { mutableStateOf<File?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var attempt by remember { mutableStateOf(0) }

    LaunchedEffect(url, cacheKey, attempt) {
        error = null
        file = null
        progress = null
        if (url == null) {
            error = "Could not load this PDF."
            return@LaunchedEffect
        }
        try {
            file = BookFileStore.ensureFile(context, cacheKey, url) { progress = it }
        } catch (e: CancellationException) {
            throw e
        } catch (e: IOException) {
            error = "Check your internet connection and try again."
        } catch (e: Exception) {
            error = "Could not load this PDF."
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ScreenBackButton(onBack)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            val readyFile = file
            val failure = error
            when {
                readyFile != null -> PdfPages(readyFile, Modifier.fillMaxSize())

                failure != null -> Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(text = failure, fontSize = 13.sp, color = WisdomMuted)
                    if (url != null) {
                        Spacer(modifier = Modifier.size(14.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(WisdomCyan.copy(alpha = 0.12f))
                                .clickable { attempt += 1 }
                                .padding(horizontal = 18.dp, vertical = 8.dp)
                        ) {
                            Text(text = "Retry", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = WisdomCyan)
                        }
                    }
                }

                else -> Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    val p = progress
                    if (p != null) {
                        LinearProgressIndicator(progress = { p }, color = WisdomCyan, modifier = Modifier.fillMaxWidth())
                    } else {
                        CircularProgressIndicator(color = WisdomCyan)
                    }
                }
            }
        }
    }
}

@Composable
private fun PdfPages(file: File, modifier: Modifier) {
    var renderer by remember(file) { mutableStateOf<PdfRenderer?>(null) }
    var failed by remember(file) { mutableStateOf(false) }
    val mutex = remember(file) { Mutex() }
    val cache = remember(file) {
        val kb = (Runtime.getRuntime().maxMemory() / 1024L / 8L).toInt().coerceAtLeast(8 * 1024)
        object : LruCache<Int, Bitmap>(kb) {
            override fun sizeOf(key: Int, value: Bitmap): Int = value.byteCount / 1024
        }
    }

    DisposableEffect(file) {
        var opened: PdfRenderer? = null
        var descriptor: ParcelFileDescriptor? = null
        try {
            descriptor = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
            opened = PdfRenderer(descriptor)
            renderer = opened
        } catch (e: Exception) {
            failed = true
            runCatching { descriptor?.close() }
        }
        onDispose {
            renderer = null
            runCatching { opened?.close() }
            runCatching { descriptor?.close() }
            cache.evictAll()
        }
    }

    val ready = renderer
    if (failed) {
        Box(modifier = modifier.padding(24.dp), contentAlignment = Alignment.Center) {
            Text(text = "Could not load this PDF.", fontSize = 13.sp, color = WisdomMuted)
        }
        return
    }
    if (ready == null) {
        Box(modifier = modifier, contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = WisdomCyan)
        }
        return
    }

    val pageCount = ready.pageCount
    val listState = rememberLazyListState()
    val currentPage by remember { derivedStateOf { listState.firstVisibleItemIndex + 1 } }
    val widthPx = (LocalConfiguration.current.screenWidthDp * LocalDensity.current.density).toInt().coerceAtLeast(240)

    Box(modifier = modifier) {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(count = pageCount, key = { it }) { index ->
                PdfPageImage(index, ready, mutex, widthPx, cache)
            }
        }
        Text(
            text = "Page $currentPage / $pageCount",
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(12.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(Color(0xFF111B2E).copy(alpha = 0.85f))
                .padding(horizontal = 10.dp, vertical = 5.dp)
        )
    }
}

@Composable
private fun PdfPageImage(
    index: Int,
    renderer: PdfRenderer,
    mutex: Mutex,
    widthPx: Int,
    cache: LruCache<Int, Bitmap>
) {
    val bitmap by produceState<Bitmap?>(initialValue = cache.get(index), index, renderer, widthPx) {
        if (value == null) {
            val rendered = withContext(Dispatchers.IO) {
                mutex.withLock { renderPage(renderer, index, widthPx) }
            }
            if (rendered != null) cache.put(index, rendered)
            value = rendered
        }
    }
    val bmp = bitmap
    if (bmp != null) {
        Image(
            bitmap = bmp.asImageBitmap(),
            contentDescription = "Page ${index + 1}",
            contentScale = ContentScale.FillWidth,
            modifier = Modifier.fillMaxWidth()
        )
    } else {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(0.707f)
                .background(Color.White.copy(alpha = 0.06f)),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = WisdomCyan, modifier = Modifier.size(24.dp))
        }
    }
}

/** Draws one page, white background, [widthPx] wide. Returns null when the page cannot be drawn. */
private fun renderPage(renderer: PdfRenderer, index: Int, widthPx: Int): Bitmap? = try {
    val page = renderer.openPage(index)
    try {
        val height = (widthPx * page.height.toFloat() / page.width.toFloat()).toInt().coerceAtLeast(1)
        val bmp = Bitmap.createBitmap(widthPx, height, Bitmap.Config.ARGB_8888)
        bmp.eraseColor(android.graphics.Color.WHITE)
        page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
        bmp
    } finally {
        page.close()
    }
} catch (e: Exception) {
    null
}
