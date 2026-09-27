import { useState } from "react";
import TabHeader from "../../shell/TabHeader";
import ClockCard from "./components/ClockCard";
import WeatherCard from "./components/WeatherCard";
import StyleCard from "./components/StyleCard";
import { useWeather } from "./hooks/useWeather";
import "./MorningTab.css";

// 모닝팩 (원본: D:\mochestra_mpack 의 App.jsx)
export default function MorningTab() {
  const [showClock, setShowClock] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [showStyle, setShowStyle] = useState(true);
  // 날씨는 한 번만 불러와서 날씨 카드와 스타일 카드가 함께 사용
  const { weather, status } = useWeather();

  return (
    <div className="morning-tab">
      <TabHeader title="모닝팩" subtitle="morning pack" />
      <div className="card-stack">
        {showClock && <ClockCard onClose={() => setShowClock(false)} />}
        {showWeather && (
          <WeatherCard weather={weather} status={status} onClose={() => setShowWeather(false)} />
        )}
        {showStyle && (
          <StyleCard weather={weather} status={status} onClose={() => setShowStyle(false)} />
        )}
      </div>
    </div>
  );
}
