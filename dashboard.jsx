// CodeArena React Dashboard Component
// Loaded via Babel Standalone in the browser.

function Dashboard() {
  const [submissions, setSubmissions] = React.useState({});
  const [dailyTarget, setDailyTarget] = React.useState(() => {
    try {
      const saved = localStorage.getItem("codearena_daily_target");
      return saved ? parseInt(saved, 10) : 3;
    } catch (e) {
      return 3;
    }
  });

  const [todaySolved, setTodaySolved] = React.useState(() => {
    try {
      const todayStr = new Date().toDateString();
      const saved = localStorage.getItem("codearena_today_progress");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) {
          return parsed.ids || [];
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Sync state with global submissions on load
  React.useEffect(() => {
    // Read initial submissions from global submissions variable or localStorage
    if (window.submissions) {
      setSubmissions({ ...window.submissions });
    }

    const handleUpdate = (e) => {
      const updatedSubmissions = e.detail;
      setSubmissions({ ...updatedSubmissions });

      // Update today's solved list if a new problem is solved
      const todayStr = new Date().toDateString();
      const solvedIds = Object.keys(updatedSubmissions).filter(id => updatedSubmissions[id].solved);
      
      setTodaySolved(prev => {
        // Find which solved IDs were solved today
        // (Since we don't have historical timestamps, we add any newly solved ID to today's list)
        const newToday = [...prev];
        let changed = false;
        solvedIds.forEach(id => {
          if (!newToday.includes(id)) {
            newToday.push(id);
            changed = true;
          }
        });
        if (changed || prev.length === 0) {
          try {
            localStorage.setItem("codearena_today_progress", JSON.stringify({
              date: todayStr,
              ids: newToday
            }));
          } catch (e) {}
          return newToday;
        }
        return prev;
      });
    };

    window.addEventListener("submissions-updated", handleUpdate);
    return () => {
      window.removeEventListener("submissions-updated", handleUpdate);
    };
  }, []);

  // Save daily target
  React.useEffect(() => {
    try {
      localStorage.setItem("codearena_daily_target", dailyTarget.toString());
    } catch (e) {}
  }, [dailyTarget]);

  // Calculations
  const totalProblems = window.PROBLEMS ? window.PROBLEMS.length : 0;
  const solvedCount = Object.values(submissions).filter(s => s.solved).length;
  const percentage = totalProblems ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Breakdown by difficulty
  const breakdown = React.useMemo(() => {
    const counts = { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } };
    if (!window.PROBLEMS) return counts;

    window.PROBLEMS.forEach(p => {
      if (counts[p.difficulty]) {
        counts[p.difficulty].total++;
        if (submissions[p.id] && submissions[p.id].solved) {
          counts[p.difficulty].solved++;
        }
      }
    });
    return counts;
  }, [submissions]);

  // Motivational message
  const quote = React.useMemo(() => {
    if (percentage === 100) return "Incredible! You have solved all the problems in CodeArena! 🎉";
    if (percentage >= 75) return "Spectacular! You are masterfully navigating these challenges. 🚀";
    if (percentage >= 50) return "Halfway there! Keep this momentum going, you're doing great! 💪";
    if (percentage >= 25) return "Great job! Your problem-solving skills are expanding rapidly. ⚡";
    if (percentage > 0) return "Excellent start! Every challenge you face makes you stronger. 🧠";
    return "Ready to write some code? Choose a problem below and let's begin! 👇";
  }, [percentage]);

  const handleTargetChange = (amount) => {
    setDailyTarget(prev => Math.max(1, Math.min(10, prev + amount)));
  };

  const handleResetClick = () => {
    if (window.confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
      // Clear today's progress
      setTodaySolved([]);
      try {
        localStorage.removeItem("codearena_today_progress");
      } catch (e) {}
      
      // Trigger global reset
      if (window.resetSubmissions) {
        window.resetSubmissions();
      }
    }
  };

  // SVG Circular progress details
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <h3 className="dashboard-title">CodeArena Analytics</h3>
          <p className="dashboard-subtitle">Track your DSA preparation stats in real time</p>
        </div>
        <button className="dashboard-reset-btn" onClick={handleResetClick} title="Reset all solved problems">
          Reset Progress
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Progress Circle Card */}
        <div className="analytics-box progress-box">
          <div className="circle-container">
            <svg className="svg-circle" width="90" height="90" viewBox="0 0 90 90">
              <circle className="circle-bg" cx="45" cy="45" r={radius} />
              <circle 
                className="circle-fill" 
                cx="45" 
                cy="45" 
                r={radius} 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="circle-text">
              <span className="circle-percent">{percentage}%</span>
              <span className="circle-label">Done</span>
            </div>
          </div>
          <div className="progress-details">
            <div className="progress-stat-num">{solvedCount} / {totalProblems}</div>
            <div className="progress-stat-lbl">Problems Solved</div>
          </div>
        </div>

        {/* Difficulty Breakdown Card */}
        <div className="analytics-box difficulty-box">
          <h4 className="box-title">Difficulty Breakdown</h4>
          <div className="diff-bar-list">
            <div className="diff-bar-item">
              <div className="diff-bar-info">
                <span className="diff-name text-easy">Easy</span>
                <span className="diff-val">{breakdown.Easy.solved}/{breakdown.Easy.total}</span>
              </div>
              <div className="diff-bar-track">
                <div 
                  className="diff-bar-fill bg-easy" 
                  style={{ width: `${breakdown.Easy.total ? (breakdown.Easy.solved / breakdown.Easy.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="diff-bar-item">
              <div className="diff-bar-info">
                <span className="diff-name text-medium">Medium</span>
                <span className="diff-val">{breakdown.Medium.solved}/{breakdown.Medium.total}</span>
              </div>
              <div className="diff-bar-track">
                <div 
                  className="diff-bar-fill bg-medium" 
                  style={{ width: `${breakdown.Medium.total ? (breakdown.Medium.solved / breakdown.Medium.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="diff-bar-item">
              <div className="diff-bar-info">
                <span className="diff-name text-hard">Hard</span>
                <span className="diff-val">{breakdown.Hard.solved}/{breakdown.Hard.total}</span>
              </div>
              <div className="diff-bar-track">
                <div 
                  className="diff-bar-fill bg-hard" 
                  style={{ width: `${breakdown.Hard.total ? (breakdown.Hard.solved / breakdown.Hard.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Target Card */}
        <div className="analytics-box target-box">
          <h4 className="box-title">Daily Goal Tracker</h4>
          <div className="target-controls">
            <span className="target-lbl">Goal:</span>
            <button className="target-btn" onClick={() => handleTargetChange(-1)}>-</button>
            <span className="target-num">{dailyTarget}</span>
            <button className="target-btn" onClick={() => handleTargetChange(1)}>+</button>
            <span className="target-lbl">per day</span>
          </div>

          <div className="target-progress-row">
            <span className="target-progress-lbl">Today's Progress:</span>
            <span className="target-progress-val">
              {Math.min(todaySolved.length, dailyTarget)} / {dailyTarget}
            </span>
          </div>
          
          <div className="target-bar-track">
            <div 
              className="target-bar-fill" 
              style={{ width: `${Math.min(100, (todaySolved.length / dailyTarget) * 100)}%` }}
            />
          </div>
          <div className="target-motivational">
            {todaySolved.length >= dailyTarget ? "🎉 Daily Goal Achieved!" : "Keep coding to hit your target!"}
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <span className="quote-icon">💡</span>
        <span className="quote-text">{quote}</span>
      </div>
    </div>
  );
}

// Render the component
const container = document.getElementById('dashboard-root');
const root = ReactDOM.createRoot(container);
root.render(<Dashboard />);
