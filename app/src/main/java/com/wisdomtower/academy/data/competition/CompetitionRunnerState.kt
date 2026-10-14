package com.wisdomtower.academy.data.competition

// C6 slice 1: the state of one exam attempt, as plain Kotlin. NO network, NO Compose, NO Android classes.
// The ranked exam screen (a later slice) will hold one of these, redraw from it, call
// CompetitionRepository.saveAnswers with answersSnapshot() and markSaved(...) after each autosave, and
// call CompetitionRepository.submit when time is up or the student presses Submit.
//
// Time: the DATABASE decides the deadline (session.deadlineAtMs is the global ends_at for ranked,
// null for practice). The screen passes in CompetitionRepository.serverNowMs() so the countdown follows the
// server clock. The phone clock never decides anything here; the server still refuses late saves.
//
// Status: written, not compiled, not used by any screen yet.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
class CompetitionRunnerState(val session: CompetitionSession) {

    val questions: List<CompetitionQuestion> = session.questions

    val isRanked: Boolean = session.mode == "ranked"

    private val answers: LinkedHashMap<String, Int> = LinkedHashMap()
    private var savedAnswers: Map<String, Int> = emptyMap()

    var currentIndex: Int = 0
        private set

    init {
        // resume: keep only answers that belong to a question of this attempt and a choice that exists
        for ((questionId, choice) in session.answers) {
            val question = questions.firstOrNull { it.id == questionId }
            if (question != null && choice >= 0 && choice < question.choices.size) {
                answers[questionId] = choice
            }
        }
        // what the server already holds is what it sent us
        savedAnswers = LinkedHashMap(answers)
    }

    val questionCount: Int
        get() = questions.size

    fun currentQuestion(): CompetitionQuestion? = questions.getOrNull(currentIndex)

    fun answerFor(questionId: String): Int? = answers[questionId]

    val answeredCount: Int
        get() = answers.size

    val unansweredCount: Int
        get() = questions.size - answers.size

    fun isAnswered(index: Int): Boolean {
        val question = questions.getOrNull(index) ?: return false
        return answers.containsKey(question.id)
    }

    /** Chooses an answer. Returns false (and changes nothing) for an unknown question or a choice that does not exist. */
    fun select(questionId: String, choice: Int): Boolean {
        val question = questions.firstOrNull { it.id == questionId } ?: return false
        if (choice < 0 || choice >= question.choices.size) return false
        if (answers[questionId] == choice) return true
        answers[questionId] = choice
        return true
    }

    /** Moves to a question. Returns false when the index is out of range. */
    fun goTo(index: Int): Boolean {
        if (index < 0 || index >= questions.size) return false
        currentIndex = index
        return true
    }

    fun next(): Boolean = goTo(currentIndex + 1)

    fun previous(): Boolean = goTo(currentIndex - 1)

    /** A copy of all chosen answers, safe to hand to the repository from another coroutine. */
    fun answersSnapshot(): Map<String, Int> = LinkedHashMap(answers)

    /** True when something was chosen since the last successful save. */
    fun hasUnsavedChanges(): Boolean = answers != savedAnswers

    /** Call with the exact snapshot that the server accepted, so answers chosen meanwhile stay unsaved. */
    fun markSaved(snapshot: Map<String, Int>) {
        savedAnswers = LinkedHashMap(snapshot)
    }

    /** Milliseconds left until the deadline, never below zero. Null for practice (no deadline). */
    fun remainingMs(serverNowMs: Long): Long? {
        val deadline = session.deadlineAtMs ?: return null
        return maxOf(0L, deadline - serverNowMs)
    }

    /** True once a ranked deadline has passed. Practice never times out here. */
    fun isTimeUp(serverNowMs: Long): Boolean {
        val left = remainingMs(serverNowMs) ?: return false
        return left <= 0L
    }
}
