import { Card, CardBody, CardHeader } from "@heroui/react";
import React from "react";

interface MetricsProps {
  title: string;
  value: number;
  icon?: string;
  color?: 'blue' | 'purple' | 'red' | 'green' | 'orange';
  growth?: string;
}

const colorSchemes = {
  blue: {
    bg: 'from-blue-600/20 to-blue-800/20',
    border: 'border-blue-600/30',
    text: 'text-blue-400',
    icon: 'bg-blue-600/20'
  },
  purple: {
    bg: 'from-purple-600/20 to-purple-800/20',
    border: 'border-purple-600/30',
    text: 'text-purple-400',
    icon: 'bg-purple-600/20'
  },
  red: {
    bg: 'from-red-600/20 to-red-800/20',
    border: 'border-red-600/30',
    text: 'text-red-400',
    icon: 'bg-red-600/20'
  },
  green: {
    bg: 'from-green-600/20 to-green-800/20',
    border: 'border-green-600/30',
    text: 'text-green-400',
    icon: 'bg-green-600/20'
  },
  orange: {
    bg: 'from-orange-600/20 to-orange-800/20',
    border: 'border-orange-600/30',
    text: 'text-orange-400',
    icon: 'bg-orange-600/20'
  }
};

const Metrics: React.FC<MetricsProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  growth 
}) => {
  const scheme = colorSchemes[color];
  
  return (
    <Card className={`bg-gradient-to-br ${scheme.bg} ${scheme.border} border backdrop-blur-xl hover:scale-105 transition-transform duration-200`}>
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${scheme.icon} rounded-full`}>
            <span className="text-xl">{icon}</span>
          </div>
          {growth && (
            <span className="text-green-400 text-xs font-medium">
              {growth}
            </span>
          )}
        </div>
        
        <div>
          <p className={`${scheme.text} text-sm font-medium mb-1`}>
            {title}
          </p>
          <p className="text-3xl font-bold text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default Metrics;
