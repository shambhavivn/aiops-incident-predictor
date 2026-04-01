import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
;

function App() {
  const [form, setForm] = useState({
    cpu: "",
    memory: "",
    disk: "",
    alert_type: "cpu_spike",
  });
  const [alerts, setAlerts] = useState([]);
  const [prediction, setPrediction] = useState(null);

  const fetchAlerts = async () => {
    const res = await axios.get(`${API}/alerts`);
    setAlerts(res.data);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      cpu: Number(form.cpu),
      memory: Number(form.memory),
      disk: Number(form.disk),
      alert_type: form.alert_type,
    };

    const res = await axios.post(`${API}/predict`, payload);
    setPrediction(res.data);
    await fetchAlerts();

    setForm({
      cpu: "",
      memory: "",
      disk: "",
      alert_type: "cpu_spike",
    });
  };

  const chartData = [
    {
      severity: "critical",
      count: alerts.filter((a) => a.predicted_severity === "critical").length,
      color: "#dc2626",
    },
    {
      severity: "major",
      count: alerts.filter((a) => a.predicted_severity === "major").length,
      color: "#ea580c",
    },
    {
      severity: "minor",
      count: alerts.filter((a) => a.predicted_severity === "minor").length,
      color: "#2563eb",
    },
  ];

  const getSeverityClass = (severity) => {
    if (severity === "critical") return "severity critical";
    if (severity === "major") return "severity major";
    return "severity minor";
  };

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <p className="eyebrow">AIOps Monitoring Dashboard</p>
          <h1>AIOps Incident Predictor</h1>
          <p className="subtitle">
            Predict alert severity from infrastructure metrics and visualize incident trends.
          </p>
        </header>

        <section className="panel">
          <h2>Create Alert Prediction</h2>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="number"
              placeholder="CPU %"
              value={form.cpu}
              onChange={(e) => setForm({ ...form, cpu: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Memory %"
              value={form.memory}
              onChange={(e) => setForm({ ...form, memory: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Disk %"
              value={form.disk}
              onChange={(e) => setForm({ ...form, disk: e.target.value })}
              required
            />
            <select
              value={form.alert_type}
              onChange={(e) => setForm({ ...form, alert_type: e.target.value })}
            >
              <option value="cpu_spike">cpu_spike</option>
              <option value="memory_leak">memory_leak</option>
              <option value="disk_full">disk_full</option>
              <option value="service_down">service_down</option>
              <option value="network_latency">network_latency</option>
            </select>
            <button type="submit">Predict</button>
          </form>

          {prediction && (
            <div className="result-card">
              <p>Latest Prediction</p>
              <div className={getSeverityClass(prediction.predicted_severity)}>
                {prediction.predicted_severity.toUpperCase()}
              </div>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.severity} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <h2>Alert History</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CPU</th>
                  <th>Memory</th>
                  <th>Disk</th>
                  <th>Type</th>
                  <th>Predicted Severity</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.id}</td>
                    <td>{alert.cpu}</td>
                    <td>{alert.memory}</td>
                    <td>{alert.disk}</td>
                    <td>{alert.alert_type}</td>
                    <td>
                      <span className={getSeverityClass(alert.predicted_severity)}>
                        {alert.predicted_severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
