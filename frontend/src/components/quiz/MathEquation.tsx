import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface MathEquationProps {
  equation: string;
}

const MathEquation: React.FC<MathEquationProps> = ({ equation }) => {
  return (
    <MathJaxContext>
      <MathJax dynamic>{`\\(${equation}\\)`}</MathJax>
    </MathJaxContext>
  );
};

export default MathEquation; 