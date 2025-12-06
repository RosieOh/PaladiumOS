'use client';

import React, { useState, useCallback, useMemo } from 'react';

export const Calculator = React.memo(() => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = useCallback((num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, waitingForNewValue]);

  const inputOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = useCallback(() => {
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  }, [display, previousValue, operation]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);

  const inputDecimal = useCallback(() => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  }, [display, waitingForNewValue]);

  const toggleSign = useCallback(() => {
    if (display !== '0') {
      setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display);
    }
  }, [display]);

  const percentage = useCallback(() => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
    setWaitingForNewValue(true);
  }, [display]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 p-4 flex flex-col gap-2">
        {/* Display */}
        <div className="bg-gray-900 text-white p-6 rounded-lg text-right font-mono text-4xl font-light min-h-[100px] flex items-center justify-end overflow-x-auto">
          {display}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2 flex-1">
          {/* Row 1 */}
          <button
            onClick={clear}
            className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-900 font-semibold rounded-lg transition-colors"
            aria-label="Clear"
          >
            C
          </button>
          <button
            onClick={toggleSign}
            className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-900 font-semibold rounded-lg transition-colors"
            aria-label="Toggle sign"
          >
            ±
          </button>
          <button
            onClick={percentage}
            className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-900 font-semibold rounded-lg transition-colors"
            aria-label="Percentage"
          >
            %
          </button>
          <button
            onClick={() => inputOperation('÷')}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            aria-label="Divide"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button onClick={() => inputNumber('7')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">7</button>
          <button onClick={() => inputNumber('8')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">8</button>
          <button onClick={() => inputNumber('9')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">9</button>
          <button
            onClick={() => inputOperation('×')}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            aria-label="Multiply"
          >
            ×
          </button>

          {/* Row 3 */}
          <button onClick={() => inputNumber('4')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">4</button>
          <button onClick={() => inputNumber('5')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">5</button>
          <button onClick={() => inputNumber('6')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">6</button>
          <button
            onClick={() => inputOperation('-')}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            aria-label="Subtract"
          >
            −
          </button>

          {/* Row 4 */}
          <button onClick={() => inputNumber('1')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">1</button>
          <button onClick={() => inputNumber('2')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">2</button>
          <button onClick={() => inputNumber('3')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors">3</button>
          <button
            onClick={() => inputOperation('+')}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            aria-label="Add"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputNumber('0')}
            className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors col-span-2"
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors"
            aria-label="Decimal point"
          >
            .
          </button>
          <button
            onClick={performCalculation}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            aria-label="Equals"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
});

Calculator.displayName = 'Calculator';

