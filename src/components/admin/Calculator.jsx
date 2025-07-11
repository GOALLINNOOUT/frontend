import React, { useState, useRef, useEffect } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('');
  const [answer, setAnswer] = useState('');
  const [isOpen, setIsOpen] = useState(false); // Default to closed
  const [position, setPosition] = useState({ x: 40, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState('basic'); // 'basic', 'discount', 'profit'
  const [dimensions, setDimensions] = useState({ width: 360, height: 520 });
  const [resizing, setResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  // Advanced calculator states
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [advancedResult, setAdvancedResult] = useState('');

  // Button values for basic calculator
  const basicButtons = [
    ['C', 'DEL', '%', '/'],
    ['7', '8', '9', 'x'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['00', '0', '.', '='],
  ];

  // Handle basic calculator button click
  const handleButtonClick = (val) => {
    if (val === 'C') {
      setDisplay('');
      setAnswer('');
    } else if (val === 'DEL') {
      setDisplay(display.slice(0, -1));
    } else if (val === '=') {
      try {
        let exp = display.replace(/x/g, '*').replace(/%/g, '/100');
        // eslint-disable-next-line no-eval
        let ans = eval(exp);
        setAnswer(parseFloat(ans.toFixed(8)));
      } catch {
        setAnswer('Error');
      }
    } else {
      setDisplay(display + val);
    }
  };

  // Advanced calculations
  const calculateDiscount = () => {
    const original = parseFloat(originalPrice);
    const discountAmt = parseFloat(discountAmount);
    const discountPct = parseFloat(discountPercent);
    
    if (original && discountAmt) {
      // Calculate what discount percentage would result in this discount amount
      const percentage = ((discountAmt / original) * 100).toFixed(2);
      const finalPrice = original - discountAmt;
      setAdvancedResult(`Selling Price: ₦${finalPrice.toFixed(2)} | Discount: ${percentage}%`);
    } else if (original && discountPct) {
      // Calculate discount amount from percentage
      const discountValue = (original * discountPct) / 100;
      const finalPrice = original - discountValue;
      setAdvancedResult(`Selling Price: ₦${finalPrice.toFixed(2)} | Discount: ₦${discountValue.toFixed(2)}`);
    } else {
      setAdvancedResult('Please enter valid values');
    }
  };

  const calculateProfitLoss = () => {
    const cost = parseFloat(costPrice);
    const selling = parseFloat(sellingPrice);
    
    if (cost && selling) {
      const difference = selling - cost;
      const percentage = ((difference / cost) * 100).toFixed(2);
      const type = difference >= 0 ? 'Profit' : 'Loss';
      setAdvancedResult(`${type}: ₦${Math.abs(difference).toFixed(2)} | ${percentage}%`);
    } else {
      setAdvancedResult('Please enter valid values');
    }
  };

  const calculateSellingPrice = () => {
    const cost = parseFloat(costPrice);
    const discountPct = parseFloat(discountPercent);
    
    if (cost && discountPct) {
      const sellingPriceCalc = cost / (1 - discountPct / 100);
      setAdvancedResult(`Selling Price: ₦${sellingPriceCalc.toFixed(2)}`);
    } else {
      setAdvancedResult('Please enter valid values');
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };

  // Resize handlers
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };
    document.body.style.userSelect = 'none';
  };

  const handleResizeMouseMove = (e) => {
    if (!resizing) return;
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    setDimensions({
      width: Math.max(320, resizeStart.current.width + dx),
      height: Math.max(400, resizeStart.current.height + dy),
    });
  };

  const handleResizeMouseUp = () => {
    setResizing(false);
    document.body.style.userSelect = '';
  };

  // Touch drag handlers
  const handleTouchStart = (e) => {
    setDragging(true);
    const touch = e.touches[0];
    dragOffset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
    document.body.style.userSelect = 'none';
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragOffset.current.x,
      y: touch.clientY - dragOffset.current.y,
    });
  };
  const handleTouchEnd = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };

  // Touch resize handlers
  const handleResizeTouchStart = (e) => {
    setResizing(true);
    const touch = e.touches[0];
    resizeStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };
    document.body.style.userSelect = 'none';
  };
  const handleResizeTouchMove = (e) => {
    if (!resizing) return;
    const touch = e.touches[0];
    const dx = touch.clientX - resizeStart.current.x;
    const dy = touch.clientY - resizeStart.current.y;
    setDimensions({
      width: Math.max(320, resizeStart.current.width + dx),
      height: Math.max(400, resizeStart.current.height + dy),
    });
  };

  const handleResizeTouchEnd = () => {
    setResizing(false);
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging]);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
      window.addEventListener('touchmove', handleResizeTouchMove);
      window.addEventListener('touchend', handleResizeTouchEnd);
    } else {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
      window.removeEventListener('touchmove', handleResizeTouchMove);
      window.removeEventListener('touchend', handleResizeTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
      window.removeEventListener('touchmove', handleResizeTouchMove);
      window.removeEventListener('touchend', handleResizeTouchEnd);
    };
  }, [resizing]);

  // Ref for the calculator container
  const calculatorRef = useRef(null);

  // Scroll to calculator when opened
  useEffect(() => {
    if (isOpen && calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen]);

  const getButtonClass = (btn) => {
    if (btn === 'C') return 'calculator-btn clear';
    if (btn === '=') return 'calculator-btn equals';
    if (['+', '-', 'x', '/', '%'].includes(btn)) return 'calculator-btn operator';
    if (btn === 'DEL') return 'calculator-btn function';
    return 'calculator-btn number';
  };

  if (!isOpen) {
    return (
      <button
        className="calculator-float-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open Calculator"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.2"/>
          <rect x="6" y="6" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">123</text>
        </svg>
      </button>
    );
  }

  return (
    <div className="calculator-modal-overlay">
      <div
        ref={calculatorRef}
        className="calculator-float calculator-modal"
        style={{
          left: position.x,
          top: position.y,
          cursor: dragging ? 'grabbing' : 'grab',
          position: 'fixed',
          zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          background: 'rgba(30,30,30,0.98)',
          borderRadius: '1rem',
          minWidth: 320,
          maxWidth: 600,
          minHeight: 400,
          width: dimensions.width,
          height: dimensions.height,
          maxHeight: '90vh',
          overflowY: 'auto',
          transition: 'box-shadow 0.2s',
          resize: 'none',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        // onMouseMove and onMouseUp handled globally
      >
        <div
          className="calculator-float-header"
          style={{ cursor: 'grab', userSelect: 'none' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <span>Sales Calculator</span>
          <button
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close Calculator"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>
        
        <div className="calculator-float-body">
          {/* Mode Toggle */}
          <div className="calculator-mode-toggle">
            <button
              className={`calculator-mode-btn ${mode === 'basic' ? 'active' : ''}`}
              onClick={() => setMode('basic')}
            >
              Basic
            </button>
            <button
              className={`calculator-mode-btn ${mode === 'discount' ? 'active' : ''}`}
              onClick={() => setMode('discount')}
            >
              Discount
            </button>
            <button
              className={`calculator-mode-btn ${mode === 'profit' ? 'active' : ''}`}
              onClick={() => setMode('profit')}
            >
              Profit/Loss
            </button>
          </div>

          {/* Basic Calculator Mode */}
          {mode === 'basic' && (
            <>
              <div className="calculator-display">
                <div className="expression">{display || '0'}</div>
                <div className="result">{answer !== '' ? answer : ''}</div>
              </div>
              <div className="calculator-buttons">
                {basicButtons.flat().map((btn, i) => (
                  <button
                    key={btn + i}
                    className={getButtonClass(btn)}
                    onClick={() => handleButtonClick(btn)}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Discount Calculator Mode */}
          {mode === 'discount' && (
            <div className="calculator-advanced-panel">
              <h3>Discount Calculator</h3>
              <div className="calculator-input-group">
                <label>Original Price (₦)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Enter original price"
                />
              </div>
              <div className="calculator-input-group">
                <label>Discount Amount (₦)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => {
                    setDiscountAmount(e.target.value);
                    setDiscountPercent('');
                  }}
                  placeholder="Enter discount amount"
                />
              </div>
              <div className="calculator-input-group">
                <label>OR Discount Percentage (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => {
                    setDiscountPercent(e.target.value);
                    setDiscountAmount('');
                  }}
                  placeholder="Enter discount percentage"
                />
              </div>
              <button
                className="calculator-btn equals w-full"
                onClick={calculateDiscount}
              >
                Calculate Discount
              </button>
              {advancedResult && (
                <div className="calculator-result-display">
                  <div className="result-label">Result:</div>
                  <div className="result-value">{advancedResult}</div>
                </div>
              )}
            </div>
          )}

          {/* Profit/Loss Calculator Mode */}
          {mode === 'profit' && (
            <div className="calculator-advanced-panel">
              <h3>Profit/Loss Calculator</h3>
              <div className="calculator-input-group">
                <label>Cost Price (₦)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="Enter cost price"
                />
              </div>
              <div className="calculator-input-group">
                <label>Selling Price (₦)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="Enter selling price"
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="calculator-btn equals flex-1"
                  onClick={calculateProfitLoss}
                >
                  Calculate P/L
                </button>
                <button
                  className="calculator-btn operator flex-1"
                  onClick={calculateSellingPrice}
                >
                  Find Selling Price
                </button>
              </div>
              <div className="calculator-input-group mt-3">
                <label>Desired Profit Margin (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Enter profit margin %"
                />
              </div>
              {advancedResult && (
                <div className="calculator-result-display">
                  <div className="result-label">Result:</div>
                  <div className="result-value">{advancedResult}</div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Resize handle */}
        <div
          className="calculator-resize-handle"
          onMouseDown={handleResizeMouseDown}
          onTouchStart={handleResizeTouchStart}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 24,
            height: 24,
            cursor: 'nwse-resize',
            zIndex: 10000,
            background: 'transparent',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
          aria-label="Resize Calculator"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 18L18 2" stroke="#aaa" strokeWidth="2"/>
            <path d="M10 18L18 10" stroke="#aaa" strokeWidth="2"/>
            <path d="M6 18L18 6" stroke="#aaa" strokeWidth="2"/>
          </svg>
        </div>
      </div>
      <style>{`
        .calculator-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9998;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }
        .calculator-modal {
          margin: auto;
          box-sizing: border-box;
        }
        .calculator-resize-handle svg {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default Calculator;