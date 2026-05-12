import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useDashboardData from "./DashBorad/useDashboardData";
import { RankCard, SurveyCard, PerformanceChart, RecommendationForm, UserActivity, EvaluationList } from "./DashBorad/DashboardComponents";

const Dashboard = () => {
  const { rank, chartData, recommendation, setRecommendation, submitRecommendation, feedbackList } = useDashboardData();

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />

      {/* Rank & Survey Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <RankCard rank={rank} />
        <SurveyCard />
      </div>

      {/* Performance Chart & User Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <PerformanceChart chartData={chartData} />
        <UserActivity />
      </div>

      {/* Evaluation List & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <EvaluationList feedbackList={feedbackList} />
        <RecommendationForm recommendation={recommendation} setRecommendation={setRecommendation} submitRecommendation={submitRecommendation} />
      </div>
    </div>
  );
};

export default Dashboard;
