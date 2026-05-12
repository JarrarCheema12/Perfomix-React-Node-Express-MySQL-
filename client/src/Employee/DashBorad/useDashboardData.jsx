import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const useDashboardData = () => {
  const [rank, setRank] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [], backgroundColor: ["#A9D1FF", "#0057FF", "#C4DFF6", "#4A9EFF"], borderWidth: 0 }] });
  const [recommendation, setRecommendation] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/staff/view-staff-dashboard", { headers: { Authorization: `${token}` } });
        setRank(response.data.rank);


        // toast.success("Dashboard data loaded successfully!");
      } catch (error) {
        toast.error("Error fetching dashboard data.");
        console.error("Error fetching dashboard data:", error);
      }
    };

    const fetchEvaluationData = async () => {
        try {
          const response = await axios.get("http://localhost:8080/user/get-evaluations", {
            headers: { Authorization: `${token}` }
          });
      
          if (!response.data.evaluations || response.data.evaluations.length === 0) {
            console.warn("No evaluation data found.");
            toast.warn("No evaluation data available.");
            return;
          }
      
          // Extracting data for Doughnut Chart
          const labels = response.data.evaluations.map(evaluation => evaluation.metric_name);
          const percentages = response.data.evaluations.map(evaluation => 
            ((evaluation.marks_obtained / evaluation.total_weightage) * 100).toFixed(2) // Convert to percentage
          );
      
          // Update the evaluation chart data for Doughnut Chart
          setChartData({
            labels,
            datasets: [
              {
                data: percentages,
                backgroundColor: ["#A9D1FF", "#0057FF", "#C4DFF6", "#4A9EFF"],
                borderWidth: 0
              }
            ],
          });
      
          // Extracting feedback correctly
          const feedbacks = response.data.evaluations
            .map(evaluation => evaluation.feedback)
            .filter(feedback => feedback && feedback.trim().length > 0); // Remove empty feedbacks
      
          setFeedbackList(feedbacks);
      
          // toast.success("Evaluation data fetched successfully!");
        } catch (error) {
          toast.error("Error fetching evaluation data.");
          console.error("Error fetching evaluation data:", error);
        }
      };
      

    fetchDashboardData();
    fetchEvaluationData();
  }, []);

  const submitRecommendation = async () => {
    if (!recommendation.trim()) {
      toast.warn("Recommendation cannot be empty!");
      return;
    }
    try {
      await axios.post("http://localhost:8080/recommendation/add-recommendation", { recommendation_text: recommendation }, { headers: { Authorization: `${token}`, "Content-Type": "application/json" } });
      setRecommendation("");
      toast.success("Recommendation submitted successfully!");
    } catch (error) {
      toast.error("Error submitting recommendation.");
      console.error("Error submitting recommendation:", error);
    }
  };

  return { rank, chartData, recommendation, setRecommendation, submitRecommendation, feedbackList };
};

export default useDashboardData;
