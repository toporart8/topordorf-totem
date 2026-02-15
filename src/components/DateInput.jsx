import React from 'react';

const DateInput = ({ value, onChange }) => {
    const handleChange = (field, val) => {
        onChange({ ...value, [field]: val });
    };

    const inputClasses = "w-full bg-black border border-zinc-700 p-3 text-center text-white focus:border-orange-500 outline-none transition-colors rounded";
    const labelClasses = "block text-zinc-500 text-xs uppercase tracking-wider mb-2 text-center";

    return (
        <div className="grid grid-cols-3 gap-4">
            <div>
                <label className={labelClasses}>День</label>
                <input
                    type="number"
                    min="1" max="31"
                    value={value.day}
                    onChange={(e) => handleChange('day', e.target.value)}
                    placeholder="DD"
                    className={inputClasses}
                />
            </div>

            <div>
                <label className={labelClasses}>Месяц</label>
                <input
                    type="number"
                    min="1" max="12"
                    value={value.month}
                    onChange={(e) => handleChange('month', e.target.value)}
                    placeholder="MM"
                    className={inputClasses}
                />
            </div>

            <div>
                <label className={labelClasses}>Год</label>
                <input
                    type="number"
                    min="1900" max="2100"
                    value={value.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    placeholder="YYYY"
                    className={inputClasses}
                />
            </div>
        </div>
    );
};

export default DateInput;
