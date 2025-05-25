'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Calendar({ onDateSelect, reservations = [], unavailableDates = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Format date as YYYY-MM-DD for comparison
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Check if a date has any reservations
  const hasReservations = (date) => {
    const formattedDate = formatDate(date);
    return reservations.some(res => res.tgl_reservasi === formattedDate);
  };

  // Check if a date is fully booked
  const isDateFullyBooked = (date) => {
    const formattedDate = formatDate(date);
    return unavailableDates.includes(formattedDate);
  };

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleDateClick = (day, month, year) => {
    const newDate = new Date(year, month, day);
    
    // Check if date is in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (newDate < now) {
      return; // Don't allow selection of past dates
    }
    
    // Check if date is fully booked
    if (isDateFullyBooked(newDate)) {
      return; // Don't allow selection of fully booked dates
    }
    
    setSelectedDate(newDate);
    onDateSelect(newDate);
  };

  // Generate calendar grid
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate days for previous month (to fill first row)
    const daysFromPrevMonth = firstDayOfMonth;
    const prevMonthDays = [];
    
    if (daysFromPrevMonth > 0) {
      const prevMonthYear = month === 0 ? year - 1 : year;
      const prevMonth = month === 0 ? 11 : month - 1;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      
      for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
        const date = new Date(prevMonthYear, prevMonth, i);
        prevMonthDays.push({
          day: i,
          month: prevMonth,
          year: prevMonthYear,
          isCurrentMonth: false,
          isPast: date < today,
          date
        });
      }
    }
    
    // Generate days for current month
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      currentMonthDays.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        isPast: date < today,
        date
      });
    }
    
    // Generate days for next month (to fill last row)
    const totalDaysAlready = prevMonthDays.length + currentMonthDays.length;
    const daysNeeded = 42 - totalDaysAlready; // 6 rows of 7 days
    const nextMonthDays = [];
    
    if (daysNeeded > 0) {
      const nextMonthYear = month === 11 ? year + 1 : year;
      const nextMonth = month === 11 ? 0 : month + 1;
      
      for (let i = 1; i <= daysNeeded; i++) {
        const date = new Date(nextMonthYear, nextMonth, i);
        nextMonthDays.push({
          day: i,
          month: nextMonth,
          year: nextMonthYear,
          isCurrentMonth: false,
          isPast: date < today,
          date
        });
      }
    }
    
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    const weeks = [];
    
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium">
            {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, index) => (
            <div key={index} className="font-medium text-gray-500 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((day, index) => {
            const isSelected = selectedDate && 
              selectedDate.getDate() === day.day && 
              selectedDate.getMonth() === day.month && 
              selectedDate.getFullYear() === day.year;
            
            const hasReservation = hasReservations(day.date);
            const isFullyBooked = isDateFullyBooked(day.date);
            
            let dayClass = "flex items-center justify-center rounded-full w-10 h-10 mx-auto";
            
            if (day.isPast) {
              dayClass += " text-gray-400 cursor-not-allowed";
            } else if (isFullyBooked) {
              dayClass += " bg-red-400 text-white cursor-not-allowed";
            } else if (hasReservation) {
              dayClass += " bg-yellow-100 hover:bg-yellow-200 cursor-pointer";
            } else if (day.isCurrentMonth) {
              dayClass += " bg-green-100 hover:bg-green-200 cursor-pointer";
            } else {
              dayClass += " text-gray-400 hover:bg-gray-100 cursor-pointer";
            }
            
            if (isSelected) {
              dayClass = "flex items-center justify-center rounded-full w-10 h-10 mx-auto bg-blue-500 text-white";
            }
            
            return (
              <div 
                key={index} 
                className={`py-1 ${day.isCurrentMonth ? '' : 'text-gray-400'}`}
              >
                <button
                  className={dayClass}
                  onClick={() => handleDateClick(day.day, day.month, day.year)}
                  disabled={day.isPast || isFullyBooked}
                >
                  {day.day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {renderCalendar()}
    </div>
  );
}