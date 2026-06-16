'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Activity, createActivity, getActivities, getTodaysActivities, saveCompletion } from './actions/activities';

export default function Home() {	
  const timerRef = useRef(null);
  
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  const [activeIndex, setActiveIndex] = useState();
  const [activities, setActivities] = useState<Activity[]>([]);

  const [activeDuration, setActiveDuration] = useState();
  const [selectedDurations, setSelectedDurations] = useState({}); // TODO: populate with current day data

  const activeActivity = activities.length ? activities[activeIndex] : null;
  const lastActivityIndex = activities?.length - 1;

	const fetchActivities = () => {
		setActivities(getActivities());
		const today = getTodaysActivities();
		console.log({today});
		const obj = {};
		today.forEach((entry) => obj[entry.duration] = entry.activity_id);
		setSelectedDurations(obj);
	}

	const markComplete = useCallback(() => {
	saveCompletion({ date: Date.now(), duration: activeDuration, activity_id: activeActivity.id });
	}, [activeDuration, activeIndex]);

  const toggleIsRunning = useCallback(() => setIsRunning(!isRunning), [isRunning, setIsRunning]);

  const addActivity = (name: string) => {
	createActivity({ label: 'journal' });
	// createActivity({ label: name });
  };

  const selectDuration = useCallback((duration) => {
	setActiveDuration(duration);
	if (!selectedDurations[duration]) {
		setActiveIndex(null)
	} else {
		setActiveIndex(activities.findIndex((item) => item.id == selectedDurations[duration]));
	};
  }, [setActiveDuration, selectedDurations, setActiveIndex]);

	useEffect(() => {
		fetchActivities();
	}, []);

	const updateTimer = useCallback(() => {
		if (!isRunning) return;
    		if (secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
	      setSecondsRemaining(secondsRemaining - 1)
	}, 1000);
      
    } else if (secondsRemaining == 0) {
      setIsRunning(false);
      clearInterval(timerRef.current);

      // TODO: prompt instead of immediately switch?
      if (activeIndex != lastActivityIndex) {
      	setActiveIndex(activeIndex + 1);
      }
    }
	}, [secondsRemaining, lastActivityIndex, setSecondsRemaining, setIsRunning, isRunning, activeIndex, setActiveIndex]);

  useEffect(() => {
    updateTimer();
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, secondsRemaining]);

  const handleSelection = useCallback(() => {
    if (activeActivity && activeDuration) {
	    setSecondsRemaining(activeDuration * 60);
	    setSelectedDurations((prev) => {
		    prev[activeDuration] = activeActivity.id;
		    return prev;
	    });
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, activeDuration, activeActivity, setSecondsRemaining, setSelectedDurations]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => handleSelection(), [activeIndex, activeDuration])

  if (!activities.length) {
	return (
		<button onClick={addActivity} className="rounded-full border border-1 border-orange text-center w-10 h-10">+</button>
	);
  }

  return (
    <div>
      <main>
        <div className="flex flex-col gap-4">
		<div>
        	<h3>Select an time</h3>
	      <div className="flex flex-row gap-4">
	        {Array(6).fill(undefined).map((_, index) => {
			const duration = index + 1;
			const isActive = activeDuration == duration;
			return (
		  <button key={`duration_${index}`} onClick={() => selectDuration(duration)} style={{ backgroundColor: isActive ? 'green' : 'transparent', borderStyle: selectedDurations[duration] ? 'solid' : 'dashed' }} className="rounded-full border-1 border-orange text-center w-10 h-10 hover:cursor-pointer">{duration}</button>
	        );
		})}
	      </div>
	  </div>
	  <div>
            <h3>Select an activity</h3>
	    <div className="flex flex-row gap-4">
	      <button onClick={addActivity} className="rounded-full border border-1 border-orange text-center w-10 h-10">+</button>
	      {activities.map((activity, index) => {
		      const isActive = activity.id == activeActivity?.id;
			      return (
		<button onClick={() => setActiveIndex(index)} key={`activity_${index}`} style={{ backgroundColor: isActive ? 'green' : 'transparent' }} className="rounded-full border border-1 border-orange text-center w-10 h-10 hover:cursor-pointer">{activity.label}</button>
	      );
	      })}
	      </div>
	  </div>
	  <div className="flex flex-col gap-2 items-center">
	  <span>{Math.trunc(secondsRemaining / 60)}:{secondsRemaining % 60}</span>
	  <button onClick={toggleIsRunning} className="flex-1 rounded-full w-12 h-12 border border-1 border-green">{isRunning ? 'pause' : 'start'}</button>
	  </div>
	  <button onClick={markComplete}>complete</button>
	</div>
      </main>
    </div>
  );
}
