<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Subtask;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{
    // Liste des sous-tâches
    public function index(Request $request, $taskId)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->findOrFail($taskId);

        return response()->json($task->subtasks);
    }

    // Créer une sous-tâche
    public function store(Request $request, $taskId)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->findOrFail($taskId);

        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $subtask = Subtask::create([
            'title'     => $request->title,
            'completed' => false,
            'task_id'   => $task->id,
        ]);

        return response()->json([
            'message' => 'Sous-tâche créée',
            'subtask' => $subtask,
        ], 201);
    }

    // Modifier une sous-tâche
    public function update(Request $request, $taskId, $subtaskId)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->findOrFail($taskId);

        $subtask = Subtask::where('task_id', $task->id)
                          ->findOrFail($subtaskId);

        $request->validate([
            'title'     => 'sometimes|string|max:255',
            'completed' => 'sometimes|boolean',
        ]);

        $subtask->update($request->only(['title', 'completed']));

        return response()->json([
            'message' => 'Sous-tâche modifiée',
            'subtask' => $subtask,
        ]);
    }

    // Supprimer une sous-tâche
    public function destroy(Request $request, $taskId, $subtaskId)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->findOrFail($taskId);

        $subtask = Subtask::where('task_id', $task->id)
                          ->findOrFail($subtaskId);

        $subtask->delete();

        return response()->json([
            'message' => 'Sous-tâche supprimée',
        ]);
    }

    // Toggler une sous-tâche
    public function toggle(Request $request, $taskId, $subtaskId)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->findOrFail($taskId);

        $subtask = Subtask::where('task_id', $task->id)
                          ->findOrFail($subtaskId);

        $subtask->update(['completed' => !$subtask->completed]);

        return response()->json([
            'message' => 'Sous-tâche mise à jour',
            'subtask' => $subtask,
        ]);
    }
}
