"use client";
import React, { useState, useEffect } from 'react';

import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// --- ICONS ---
const ChevronLeftIcon = () => <ChevronLeft size={14} />;
const ChevronRightIcon = () => <ChevronRight size={14} />;
const DropdownArrowIcon = () => <ChevronDown size={14} />;

// --- MONTH NAMES ---
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// --- HELPERS ---
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

// --- MAIN EXPORTED CALENDAR COMPONENT ---
export const AppleCalendarPicker = ({ isOpen, onClose, onDateTimeSelect, initialDate }: any) => {
    const today = initialDate ? new Date(initialDate) : new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    
    // Dropdown toggle state
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Hydration check
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Time states
    const initialHours = initialDate ? (today.getHours() % 12 || 12).toString().padStart(2, '0') : "12";
    const initialMinutes = initialDate ? today.getMinutes().toString().padStart(2, '0') : "00";
    const initialAmpm = initialDate ? (today.getHours() >= 12 ? "PM" : "AM") : "PM";

    const [hours, setHours] = useState(initialHours);
    const [minutes, setMinutes] = useState(initialMinutes);
    const [ampm, setAmpm] = useState(initialAmpm);

    if (!isOpen || !mounted) return null;

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        setSelectedDay(day);
        triggerSelect(day, hours, minutes, ampm);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 2) val = val.slice(0, 2);
        const num = parseInt(val);
        if (num > 12) val = "12";
        setHours(val);
        if (val.length === 2 && num >= 1 && num <= 12) {
            triggerSelect(selectedDay, val, minutes, ampm);
        }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 2) val = val.slice(0, 2);
        const num = parseInt(val);
        if (num > 59) val = "59";
        setMinutes(val);
        if (val.length === 2) {
            triggerSelect(selectedDay, hours, val, ampm);
        }
    };

    const handleAmpmChange = (newAmpm: string) => {
        setAmpm(newAmpm);
        triggerSelect(selectedDay, hours, minutes, newAmpm);
    };

    const triggerSelect = (day: number, hh: string, mm: string, ampmVal: string) => {
        if (onDateTimeSelect && hh.length === 2 && mm.length === 2) {
            // Build JS Date
            let h = parseInt(hh);
            if (ampmVal === 'PM' && h !== 12) h += 12;
            if (ampmVal === 'AM' && h === 12) h = 0;
            const finalDate = new Date(currentYear, currentMonth, day, h, parseInt(mm));
            onDateTimeSelect(finalDate);
        }
    };

    // Render calendar grid days
    const renderDays = () => {
        const days = [];
        // Blank cells for alignment
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
        }
        // Month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = day === selectedDay;
            days.push(
                <button
                    key={`day-${day}`}
                    onClick={() => handleSelectDay(day)}
                    className={`w-9 h-9 text-[15px] font-medium rounded-full flex items-center justify-center transition-all focus:outline-none relative ${
                        isSelected 
                            ? 'bg-cyan-500 text-ink font-bold shadow-md shadow-cyan-500/20 scale-105 z-10' 
                            : 'text-white hover:bg-white/10'
                    }`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    return require('react-dom').createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
            <div className="absolute inset-0 pointer-events-auto bg-black/40 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal Card wrapper */}
            <div className="pointer-events-auto relative w-[320px] bg-ink border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-5 transition-colors duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    {/* Month/Year selector dropdown button */}
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 text-lg font-display tracking-wider text-gold hover:text-yellow-300 transition-colors focus:outline-none"
                    >
                        <span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
                        <div className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : 'rotate-0'}`}>
                            <DropdownArrowIcon />
                        </div>
                    </button>

                    {/* Month Navigations */}
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-colors focus:outline-none">
                            <ChevronLeftIcon />
                        </button>
                        <button onClick={nextMonth} className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-colors focus:outline-none">
                            <ChevronRightIcon />
                        </button>
                    </div>
                </div>

                {/* Weekdays indicator headers */}
                <div className="grid grid-cols-7 gap-y-1 mb-3 text-center">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="text-[10px] font-bold text-chalkMuted uppercase tracking-widest">
                            {day.slice(0, 1)}
                        </div>
                    ))}
                </div>

                {/* Days Grid & Dropdown Container */}
                <div className="relative h-[240px] mb-4">
                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-2 justify-items-center absolute w-full z-10">
                        {renderDays()}
                    </div>

                    {/* Month/Year Selection Dropdown Overlay */}
                    {showDropdown && (
                        <div className="absolute inset-0 z-30 flex flex-col p-3 rounded-2xl bg-ink/95 backdrop-blur-md border border-white/10 transition-all duration-200">
                            {/* Year Selector Header */}
                            <div className="flex items-center justify-between mb-4 border-b pb-3 border-white/10">
                                <button onClick={() => setCurrentYear(y => y - 1)} className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-colors">
                                    <ChevronLeftIcon />
                                </button>
                                <span className="font-bold text-lg text-white font-display tracking-widest">{currentYear}</span>
                                <button onClick={() => setCurrentYear(y => y + 1)} className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-colors">
                                    <ChevronRightIcon />
                                </button>
                            </div>

                            {/* Month Selection Grid */}
                            <div className="grid grid-cols-3 gap-2 flex-1 overflow-y-auto custom-scrollbar">
                                {MONTH_NAMES.map((m, idx) => {
                                    const isSelected = idx === currentMonth;
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => {
                                                setCurrentMonth(idx);
                                                setShowDropdown(false);
                                            }}
                                            className={`py-2 rounded-xl text-sm font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-cyan-500 text-ink shadow-lg shadow-cyan-500/20'
                                                    : 'text-chalk hover:bg-white/10'
                                            }`}
                                        >
                                            {m.slice(0, 3)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Time Settings Row */}
                <div className="border-t border-white/10 pt-5 flex items-center justify-between">
                    <span className="text-sm font-bold text-chalkMuted uppercase tracking-widest">Time</span>
                    
                    <div className="flex items-center gap-3">
                        {/* Time Inputs Wrapper */}
                        <div className="flex items-center bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-lg font-bold text-white transition-colors duration-300 focus-within:border-cyan-400 focus-within:bg-cyan-400/5">
                            <input
                                type="text"
                                value={hours}
                                onChange={handleHourChange}
                                placeholder="00"
                                className="w-7 bg-transparent text-center focus:outline-none"
                            />
                            <span className="opacity-50 text-sm">:</span>
                            <input
                                type="text"
                                value={minutes}
                                onChange={handleMinuteChange}
                                placeholder="00"
                                className="w-7 bg-transparent text-center focus:outline-none"
                            />
                        </div>

                        {/* AM/PM Segmented Control */}
                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl text-xs font-bold text-white transition-colors duration-300">
                            <button
                                onClick={() => handleAmpmChange("AM")}
                                className={`px-3 py-2 rounded-lg transition-all focus:outline-none ${
                                    ampm === "AM" 
                                        ? 'bg-cyan-500 text-ink shadow-md' 
                                        : 'opacity-50 hover:opacity-100 hover:bg-white/10'
                                }`}
                            >
                                AM
                            </button>
                            <button
                                onClick={() => handleAmpmChange("PM")}
                                className={`px-3 py-2 rounded-lg transition-all focus:outline-none ${
                                    ampm === "PM" 
                                        ? 'bg-cyan-500 text-ink shadow-md' 
                                        : 'opacity-50 hover:opacity-100 hover:bg-white/10'
                                }`}
                            >
                                PM
                            </button>
                        </div>
                    </div>
                </div>
                
                <button 
                  onClick={() => {
                    triggerSelect(selectedDay, hours, minutes, ampm);
                    onClose();
                  }}
                  className="w-full mt-5 bg-gold hover:bg-yellow-400 text-[#000000] font-bold py-3 rounded-xl transition shadow-lg shadow-gold/20"
                >
                    Confirm Date & Time
                </button>

            </div>
        </div>
    , document.body);
};
