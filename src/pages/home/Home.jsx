import Chart from "../../components/chart/Chart";
import FeaturedInfo from "../../components/featuredInfo/FeaturedInfo";
import "./home.css";
import WidgetSm from "../../components/widgetSm/WidgetSm";
import WidgetLg from "../../components/widgetLg/WidgetLg";
import { useEffect, useState, useCallback, useMemo } from "react";
import { userRequest } from "../../redux/requestMethods";

export default function Home() {
  const [userStats, setUserStats] = useState([]);

  const MONTHS = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  const getStats = useCallback(async () => {
    try {
      const res = await userRequest.get("/users/stats");
      const statsData = res.data.map((item) => ({
        name: MONTHS[item._id - 1],
        "Active Users": item.total,
      }));

      statsData.sort((a, b) => MONTHS.indexOf(a.name) - MONTHS.indexOf(b.name));

      const lastThreeMonthsStats = statsData.slice(-3);

      setUserStats(lastThreeMonthsStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }, [MONTHS]);

  useEffect(() => {
    getStats();
  }, [getStats]);

  return (
    <div className="home">
      <FeaturedInfo />
      {userStats.length > 0 ? (
        <Chart data={userStats} title="User Analytics" grid dataKey="Active Users" />
      ) : (
        <p>Loading chart...</p>
      )}
      <div className="homeWidgets">
        <WidgetSm />
        <WidgetLg />
      </div>
    </div>
  );
}
