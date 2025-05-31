
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const buttonConfig: Array<{
  id: string;
  label: string;
  value: string;
  type: 'clear' | 'operator' | 'number' | 'equals' | 'decimal';
  className?: string;
}> = [
  { id: 'clear', label: 'AC', value: 'AC', type: 'clear', className: 'col-span-2 !bg-destructive hover:!bg-destructive/90 !text-destructive-foreground' },
  { id: 'divide', label: '÷', value: '/', type: 'operator', className: '!bg-accent hover:!bg-accent/90 !text-accent-foreground' },
  { id: 'multiply', label: '×', value: '*', type: 'operator', className: '!bg-accent hover:!bg-accent/90 !text-accent-foreground' },
  { id: 'seven', label: '7', value: '7', type: 'number' },
  { id: 'eight', label: '8', value: '8', type: 'number' },
  { id: 'nine', label: '9', value: '9', type: 'number' },
  { id: 'subtract', label: '−', value: '-', type: 'operator', className: '!bg-accent hover:!bg-accent/90 !text-accent-foreground' },
  { id: 'four', label: '4', value: '4', type: 'number' },
  { id: 'five', label: '5', value: '5', type: 'number' },
  { id: 'six', label: '6', value: '6', type: 'number' },
  { id: 'add', label: '+', value: '+', type: 'operator', className: '!bg-accent hover:!bg-accent/90 !text-accent-foreground' },
  { id: 'one', label: '1', value: '1', type: 'number' },
  { id: 'two', label: '2', value: '2', type: 'number' },
  { id: 'three', label: '3', value: '3', type: 'number' },
  { id: 'equals', label: '=', value: '=', type: 'equals', className: 'row-span-2 !bg-primary hover:!bg-primary/90 !text-primary-foreground' },
  { id: 'zero', label: '0', value: '0', type: 'number', className: 'col-span-2' },
  { id: 'decimal', label: '.', value: '.', type: 'decimal' },
];

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0'); // Current input/result shown on main display
  const [formula, setFormula] = useState(''); // Full expression history
  const [isEvaluated, setIsEvaluated] = useState(false); // Flag if '=' was last pressed

  useEffect(() => {
    // This ensures the script is loaded on the client side.
    const script = document.createElement('script');
    script.src = 'https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleClear = () => {
    setDisplay('0');
    setFormula('');
    setIsEvaluated(false);
  };

  const handleNumber = (value: string) => {
    if (isEvaluated) {
      setDisplay(value);
      setFormula(value);
      setIsEvaluated(false);
    } else {
      if (display === '0' && value === '0') { // Prevent multiple leading zeros for the number 0
        if (formula === '' || formula === '0') setFormula('0'); // Keep formula as '0'
        return;
      }
      if (display === '0' || /[+\-*/]$/.test(display)) { // If display is '0' or an operator, start new number
        setDisplay(value);
        // If formula was "0" and we type "5", formula becomes "5"
        // If formula was "X+0" and we type "5", formula becomes "X+5"
        if (formula.endsWith('0') && !/[1-9]0$/.test(formula.slice(0,-1)) && !/\.0$/.test(formula.slice(0,-1)) && (formula.length === 1 || /[+\-*/]$/.test(formula.slice(-2,-1)))) {
          setFormula(prev => prev.slice(0, -1) + value);
        } else {
          setFormula(prev => prev + value);
        }
      } else { // Append to current number
        if (display.length >= 20) return; // Limit number length
        setDisplay(prev => prev + value);
        setFormula(prev => prev + value);
      }
    }
  };

  const handleOperator = (opValue: string) => {
    if (isEvaluated) {
      setFormula(display + opValue); // display has previous result
      setIsEvaluated(false);
    } else {
       // Allow starting with minus
      if (!formula && opValue === '-') {
        setFormula(opValue);
      } else if (!formula) { // Don't allow starting with other operators
        return;
      } else {
         // Handle consecutive operators (US#13)
        setFormula(prevFormula => {
          let updatedFormula = prevFormula;
          if (opValue === '-') { // If new op is minus
            // Allow '5*-' or '5+-' but not '5*--' if already ends with '-'
            if (updatedFormula.endsWith('-') && /[+\-*/]$/.test(updatedFormula.slice(-2, -1))) { // e.g. ends with '*-' or '+-'
                // if trying to add another '-', replace '*-' with just '-' from latest op.  No, this is wrong. 5*--5 should be 5*5.
                // if prev is 5*-, new op is -, formula remains 5*-. If 5*--, new op is -, formula remains 5*--.
                // Let's simplify, if it ends with two ops, the last one being '-', e.g. '5*-'
                // pressing '-' again: '5*--'.
                 if (updatedFormula.endsWith('--')) { // prevent '---'
                    return updatedFormula;
                 }
                 return updatedFormula + opValue;

            } else { // Ends with single operator or number
              return updatedFormula + opValue;
            }
          } else { // New op is not minus (+, *, /)
            // Replace trailing operators
            let temp = updatedFormula;
            while (/[+\-*/]$/.test(temp)) {
              temp = temp.slice(0, -1);
            }
            return temp + opValue;
          }
        });
      }
    }
    setDisplay(opValue);
  };
  
  const handleDecimal = () => {
    if (isEvaluated) {
      setDisplay('0.');
      setFormula('0.');
      setIsEvaluated(false);
      return;
    }
    if (display.includes('.')) return; // Already has a decimal

    if (/[+\-*/]$/.test(display) || display === '0' || display === '') {
      setDisplay('0.');
      setFormula(prev => prev + '0.');
    } else {
      setDisplay(prev => prev + '.');
      setFormula(prev => prev + '.');
    }
  };

  const handleEquals = () => {
    if (isEvaluated || !formula) return;

    let expression = formula;
    // Remove trailing operators before evaluation
    while (/[+\-*/]$/.test(expression)) {
      expression = expression.slice(0, -1);
    }
    // Ensure expression is not empty after stripping operators
    if (!expression) {
        // If formula was just "0" or "0.0" etc. and equals is pressed
        setDisplay(display); // Keep current display
        setFormula(display + "=" + display);
        setIsEvaluated(true);
        return;
    }


    try {
      // Sanitize double minus, e.g., '5--3' to '5+3' for eval safety
      // eval handles '5*-3' correctly.
      expression = expression.replace(/--/g, '+');
      
      // eslint-disable-next-line no-eval
      let result = eval(expression);

      // Precision handling (US#15) - to at least 4 decimal places
      // Using toFixed for consistent decimal places, then parseFloat to remove trailing zeros
      if (typeof result === 'number') {
        if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-8 && result !== 0)) { // Handle very large/small numbers with scientific notation
            result = result.toExponential(8);
        } else {
            const resultStr = result.toString();
            if (resultStr.includes('.')) {
                const decimalPlaces = resultStr.split('.')[1].length;
                if (decimalPlaces > 8) {
                    result = parseFloat(result.toFixed(8));
                }
            }
        }
      }
      const resultString = String(result);

      setDisplay(resultString);
      setFormula(prev => prev + '=' + resultString);
      setIsEvaluated(true);
    } catch (error) {
      setDisplay('Error');
      setFormula(prev => prev + '=Error');
      setIsEvaluated(true);
    }
  };

  const handleClick = (btn: typeof buttonConfig[0]) => {
    switch (btn.type) {
      case 'clear': handleClear(); break;
      case 'number': handleNumber(btn.value); break;
      case 'operator': handleOperator(btn.value); break;
      case 'decimal': handleDecimal(); break;
      case 'equals': handleEquals(); break;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background font-headline">
      <Card className="w-full max-w-xs rounded-lg shadow-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="bg-muted text-right p-3 rounded mb-4 h-[70px] flex flex-col justify-between">
            <div className="text-xs text-muted-foreground truncate h-1/3" title={formula}>{formula}</div>
            <div id="display" className="text-3xl text-card-foreground truncate h-2/3">{display}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {buttonConfig.map((btn) => (
              <Button
                key={btn.id}
                id={btn.id}
                variant="outline"
                className={cn(
                  'text-xl h-16 border-border hover:bg-secondary focus:ring-2 focus:ring-ring',
                  btn.className,
                  btn.type === 'number' || btn.type === 'decimal' ? 'bg-card hover:bg-secondary' : '' // Default for numbers
                )}
                onClick={() => handleClick(btn)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
