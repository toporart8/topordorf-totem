import React, { useRef } from 'react';

const DateInput = ({ value, onChange }) => {
    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);

    const handleDayChange = (e) => {
        let val = e.target.value;
        if (val.length > 2) val = val.slice(0, 2);
        if (parseInt(val) > 31) val = "31";

        onChange({ ...value, day: val });

        if (val.length === 2 && monthRef.current) {
            monthRef.current.focus();
        }
    };

    const handleMonthChange = (e) => {
        let val = e.target.value;
        if (val.length > 2) val = val.slice(0, 2);
        if (parseInt(val) > 12) val = "12";

        onChange({ ...value, month: val });

        if (val.length === 2 && yearRef.current) {
            yearRef.current.focus();
        }
    };

    const handleYearChange = (e) => {
        const currentYear = new Date().getFullYear();
        let val = e.target.value;
        if (val.length > 4) val = val.slice(0, 4);
        if (parseInt(val) > currentYear) val = currentYear.toString();

        onChange({ ...value, year: val });
    };

    const inputClasses = "w-full bg-zinc-900/50 border border-zinc-700/50 p-3 text-center text-white focus:border-amber-500 outline-none transition-all rounded-lg text-xl font-bold placeholder:text-zinc-700 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] font-mono";
    const labelClasses = "block text-zinc-500 text-[10px] uppercase tracking-widest mb-2 text-center font-bold";

    return (
        <div className="grid grid-cols-3 gap-4">
            <div>
                <label className={labelClasses}>День</label>
                <input
                    ref={dayRef}
                    type="number"
                    value={value.day}
                    onChange={handleDayChange}
                    onFocus={(e) => e.target.select()}
                    placeholder="DD"
                    className={inputClasses}
                />
            </div>

            <div>
                <label className={labelClasses}>Месяц</label>
                <input
                    ref={monthRef}
                    type="number"
                    value={value.month}
                    onChange={handleMonthChange}
                    onFocus={(e) => e.target.select()}
                    placeholder="MM"
                    className={inputClasses}
                />
            </div>

            <div>
                <label className={labelClasses}>Год</label>
                <input
                    ref={yearRef}
                    type="number"
                    value={value.year}
                    onChange={handleYearChange}
                    onFocus={(e) => e.target.select()}
                    placeholder="YYYY"
                    className={inputClasses}
                />
            </div>
        </div>
    );
};

export default DateInput;
