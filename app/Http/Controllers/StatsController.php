<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Totaux
        $total    = Task::where('user_id', $userId)->count();
        $todo     = Task::where('user_id', $userId)->where('status', 'todo')->count();
        $doing    = Task::where('user_id', $userId)->where('status', 'doing')->count();
        $done     = Task::where('user_id', $userId)->where('status', 'done')->count();

        // Taux de complétion
        $rate = $total > 0 ? round(($done / $total) * 100) : 0;

        // Par catégorie
        $byCategory = Task::where('user_id', $userId)
            ->select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->get();

        // Par priorité
        $byPriority = Task::where('user_id', $userId)
            ->select('priority', DB::raw('count(*) as total'))
            ->groupBy('priority')
            ->get();

        // Cette semaine
        $thisWeek = Task::where('user_id', $userId)
            ->where('status', 'done')
            ->whereBetween('updated_at', [
                now()->startOfWeek(),
                now()->endOfWeek(),
            ])->count();

        // En retard
        $overdue = Task::where('user_id', $userId)
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->where('status', '!=', 'done')
            ->count();

        // 7 derniers jours
        $last7days = Task::where('user_id', $userId)
            ->where('status', 'done')
            ->where('updated_at', '>=', now()->subDays(7))
            ->select(
                DB::raw('DATE(updated_at) as date'),
                DB::raw('count(*) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total'       => $total,
            'todo'        => $todo,
            'doing'       => $doing,
            'done'        => $done,
            'rate'        => $rate,
            'thisWeek'    => $thisWeek,
            'overdue'     => $overdue,
            'byCategory'  => $byCategory,
            'byPriority'  => $byPriority,
            'last7days'   => $last7days,
        ]);
    }
}
