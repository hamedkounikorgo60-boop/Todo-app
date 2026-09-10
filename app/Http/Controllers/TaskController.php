<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::where('user_id', $request->user()->id)
                     ->with('subtasks');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'tasks' => $tasks,
            'total' => $tasks->count(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'in:todo,doing,done',
            'priority'    => 'in:low,medium,high',
            'due_date'    => 'nullable|date',
            'category'    => 'in:travail,etudes,personnel,autre',
        ]);

        $task = Task::create([
            'title'       => $request->title,
            'description' => $request->description,
            'status'      => $request->status   ?? 'todo',
            'priority'    => $request->priority ?? 'medium',
            'due_date'    => $request->due_date,
            'category'    => $request->category ?? 'autre',
            'user_id'     => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Tâche créée avec succès',
            'task'    => $task->load('subtasks'),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->with('subtasks')
                    ->findOrFail($id);

        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->findOrFail($id);

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:todo,doing,done',
            'priority'    => 'sometimes|in:low,medium,high',
            'due_date'    => 'nullable|date',
            'category'    => 'sometimes|in:travail,etudes,personnel,autre',
        ]);

        $task->update($request->only([
            'title', 'description', 'status',
            'priority', 'due_date', 'category',
        ]));

        return response()->json([
            'message' => 'Tâche modifiée avec succès',
            'task'    => $task->load('subtasks'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Tâche supprimée avec succès']);
    }

    public function complete(Request $request, $id)
    {
        $task = Task::where('user_id', $request->user()->id)
                    ->findOrFail($id);
        $task->update(['status' => 'done']);

        return response()->json([
            'message' => 'Tâche marquée comme terminée',
            'task'    => $task->load('subtasks'),
        ]);
    }
}
