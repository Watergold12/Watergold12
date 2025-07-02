// MainActivity.kt
package com.example.routinechecker

import android.app.AlertDialog
import android.content.Context
import android.media.MediaPlayer
import android.os.Bundle
import android.widget.EditText
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*
import androidx.core.content.edit



class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Surface(modifier = Modifier.fillMaxSize()) {
                RoutineApp()
            }
        }
    }
}

@Composable
fun RoutineApp() {
    val context = LocalContext.current
    val sharedPrefs = context.getSharedPreferences("routine_prefs", Context.MODE_PRIVATE)
    val coroutineScope = rememberCoroutineScope()
    val mediaPlayer = remember(context) {
        MediaPlayer.create(context, R.raw.success)
    }

    val sdf = SimpleDateFormat("yyyyMMdd", Locale.getDefault())
    val today = sdf.format(Date())

    var tasks by remember { mutableStateOf(loadTasks(sharedPrefs)) }
    var coins by remember { mutableStateOf(sharedPrefs.getInt("coins", 0)) }
    val ownedItems by remember { mutableStateOf(sharedPrefs.getStringSet("owned_items", emptySet())!!.toMutableSet()) }
    var equippedItem by remember { mutableStateOf(sharedPrefs.getString("equipped", "") ?: "") }
    var streak by remember { mutableStateOf(sharedPrefs.getInt("streak", 0)) }
    var lastActive by remember { mutableStateOf(sharedPrefs.getString("last_active", "") ?: "") }
    var streakUpdated by remember { mutableStateOf(false) }

    fun saveAll() {
        sharedPrefs.edit {
            putString("tasks", JSONArray(tasks.map { JSONObject().apply {
                put("title", it.title)
                put("completed", it.completed)
                put("id", it.id)
            }}).toString())
            putInt("coins", coins)
            putStringSet("owned_items", ownedItems)
            putString("equipped", equippedItem)
            putInt("streak", streak)
            putString("last_active", today)
            apply()
        }
    }

    if (lastActive != today && !streakUpdated) {
        val yesterday = sdf.format(Calendar.getInstance().apply { add(Calendar.DATE, -1) }.time)
        streak = if (lastActive == yesterday) streak + 1 else 1
        lastActive = today
        streakUpdated = true
        saveAll()
    }

    Column(modifier = Modifier.padding(16.dp)) {
        Text("Routine Checker", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("Coins: $coins", fontSize = 16.sp, color = Color(0xFF007F00))
        Text("🔥 Streak: $streak days", fontSize = 14.sp, color = Color.Red)

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(modifier = Modifier.weight(1f)) {
            items(tasks) { task ->
                val backgroundColor by animateColorAsState(
                    if (task.completed) Color(0xFFE0F7E9) else Color.White
                )
                val paddingAnim by animateDpAsState(targetValue = if (task.completed) 20.dp else 8.dp)

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable {
                            if (!task.completed) {
                                coins += 10
                                mediaPlayer.start()
                            }
                            tasks = tasks.map {
                                if (it.id == task.id) it.copy(completed = !it.completed) else it
                            }
                            saveAll()
                        },
                    colors = CardDefaults.cardColors(containerColor = backgroundColor)
                ) {
                    Row(
                        modifier = Modifier.padding(paddingAnim),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(task.title, fontSize = 18.sp)
                        if (task.completed) Text(" ✓", color = Color.Green, fontSize = 18.sp)
                    }
                }
            }
        }

        AvatarPreview(equippedItem)
        AvatarShop(coins, ownedItems, equippedItem) { item ->
            if (item in ownedItems) {
                equippedItem = item
            } else if (coins >= 50) {
                coins -= 50
                ownedItems.add(item)
                equippedItem = item
            }
            saveAll()
        }

        ProgressGraph(streak)
        WeeklySummary(streak, coins)

        Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
            FloatingActionButton(
                onClick = {
                    coroutineScope.launch {
                        val title = promptForInput(context)
                        if (title.isNotEmpty()) {
                            tasks = tasks + Task(title, false, System.currentTimeMillis())
                            saveAll()
                        }
                    }
                },
                containerColor = Color(0xFF007FFF),
                shape = CircleShape,
                modifier = Modifier.padding(8.dp)
            ) {
                Text("+", fontSize = 24.sp, color = Color.White)
            }
        }
    }
}

@Composable
fun AvatarPreview(equipped: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        Spacer(modifier = Modifier.height(16.dp))
        Image(
            painter = painterResource(id = R.drawable.avatar_placeholder),
            contentDescription = "Avatar",
            modifier = Modifier.size(96.dp)
        )
        Text("Equipped: ${equipped.ifEmpty { "None" }}")
    }
}

@Composable
fun AvatarShop(coins: Int, ownedItems: Set<String>, equipped: String, onEquip: (String) -> Unit) {
    val items = listOf("Hat", "Glasses", "Cape")
    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        Text("Avatar Shop", fontWeight = FontWeight.Bold)
        items.forEach { item ->
            val owned = item in ownedItems
            Button(onClick = { onEquip(item) }, enabled = owned || coins >= 50) {
                Text(if (owned) "Equip $item" else "Buy $item (50 coins)")
            }
        }
    }
}

@Composable
fun ProgressGraph(streak: Int) {
    Column(modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) {
        Text("Progress", fontWeight = FontWeight.Bold)
        val bars = (1..7).map { if (it <= streak.coerceAtMost(7)) it else 0 }
        Canvas(modifier = Modifier.fillMaxWidth().height(100.dp)) {
            val barWidth = size.width / 9f
            bars.forEachIndexed { index, value ->
                val heightRatio = value.toFloat() / 7f
                val barHeight = size.height * heightRatio
                drawRect(
                    color = Color(0xFF007F00),
                    topLeft = Offset(x = (barWidth * (index + 1)), y = size.height - barHeight),
                    size = androidx.compose.ui.geometry.Size(barWidth * 0.6f, barHeight)
                )
            }
        }
    }
}

@Composable
fun WeeklySummary(streak: Int, coins: Int) {
    Column(modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) {
        HorizontalDivider(thickness = 1.dp, color = Color.Gray)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Weekly Summary", fontWeight = FontWeight.Bold)
        Text("Total streak this week: $streak days")
        Text("Total coins earned: $coins")
    }
}

data class Task(val title: String, val completed: Boolean, val id: Long)

fun loadTasks(sharedPrefs: android.content.SharedPreferences): List<Task> {
    val tasksJson = sharedPrefs.getString("tasks", null) ?: return listOf(
        Task("Morning Exercise", false, 1),
        Task("Read 10 Pages", false, 2)
    )
    return JSONArray(tasksJson).let { array ->
        List(array.length()) { i ->
            val obj = array.getJSONObject(i)
            Task(
                title = obj.getString("title"),
                completed = obj.getBoolean("completed"),
                id = obj.getLong("id")
            )
        }
    }
}

suspend fun promptForInput(context: Context): String = withContext(Dispatchers.Main) {
    val input = EditText(context)
    var result = ""
    val latch = kotlinx.coroutines.CompletableDeferred<Unit>()
    AlertDialog.Builder(context).apply {
        setTitle("New Task")
        setView(input)
        setPositiveButton("Add") { _, _ ->
            result = input.text.toString()
            latch.complete(Unit)
        }
        setNegativeButton("Cancel") { _, _ -> latch.complete(Unit) }
        setCancelable(false)
        show()
    }
    latch.await()
    result
}

// 📁 Place these files in your Android project:
// 🔊 res/raw/success.mp3 — a fun sound effect for task completion
// 🖼️ res/drawable/avatar_placeholder.png — your placeholder avatar image (rename accordingly if needed)
