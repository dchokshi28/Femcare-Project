import React from 'react';
import ChatbotWidget from './ChatbotWidget';

/**
 * EmergencyButton has been replaced with the FemCare Assistant ChatbotWidget.
 * Re-exporting ChatbotWidget ensures full backward compatibility wherever EmergencyButton was referenced.
 */
const EmergencyButton = () => {
    return <ChatbotWidget />;
};

export default EmergencyButton;
