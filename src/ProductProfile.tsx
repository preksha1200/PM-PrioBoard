import React, { useState, useEffect } from 'react';

interface KPI {
  id: string;
  name: string;
  value: string;
  unit: string;
  target: string;
}

interface UserSegment {
  id: string;
  name: string;
  size: string;
}

interface BaselineEvent {
  id: string;
  name: string;
  dailyVolume: string;
  weeklyVolume: string;
}

interface ImpactLevel {
  name: string;
  value: number;
  description: string;
}

interface ConfidenceLevel {
  name: string;
  range: string;
  description: string;
}

interface ProductProfileData {
  productName: string;
  oneLiner: string;
  detailedDescription: string;
  northStarMetric: {
    name: string;
    value: string;
    unit: string;
    target: string;
  };
  secondaryKPIs: KPI[];
  audienceScale: {
    targetAudience: string;
    mau: string;
    wau: string;
    activeAccounts: string;
    userSegments: UserSegment[];
  };
  businessContext: {
    industry: string;
    businessModel: string;
    productStage: string;
  };
  funnelChannels: {
    touchpoints: string[];
    exposureRate: string;
    openRate: string;
    clickRate: string;
    userInteraction: string;
  };
  baselineVolumes: {
    baselineEvents: BaselineEvent[];
    baselineMetrics: string;
  };
  teamEffortUnits: {
    teamSize: string;
    monthlyPersonMonths: string;
    effortUnitPreference: 'person-weeks' | 'person-months';
    timeHorizon: 'per-week' | 'per-month';
  };
  customImpactLadder: {
    impactLevels: ImpactLevel[];
  };
  confidenceRubric: {
    confidenceLevels: ConfidenceLevel[];
  };
  constraintsRisk: {
    regulatoryConstraints: boolean;
    regulatoryDetails: string;
    performanceConstraints: string;
    infrastructureConstraints: string;
    riskTolerance: 'Low' | 'Medium' | 'High';
  };
}

interface ProductProfileProps {
  onBack: () => void;
}

const ProductProfile: React.FC<ProductProfileProps> = ({ onBack }) => {
  const [profileData, setProfileData] = useState<ProductProfileData>({
    productName: '',
    oneLiner: '',
    detailedDescription: '',
    northStarMetric: {
      name: '',
      value: '',
      unit: '',
      target: ''
    },
    secondaryKPIs: [],
    audienceScale: {
      targetAudience: '',
      mau: '',
      wau: '',
      activeAccounts: '',
      userSegments: []
    },
    businessContext: {
      industry: '',
      businessModel: '',
      productStage: ''
    },
    funnelChannels: {
      touchpoints: [],
      exposureRate: '',
      openRate: '',
      clickRate: '',
      userInteraction: ''
    },
    baselineVolumes: {
      baselineEvents: [],
      baselineMetrics: ''
    },
    teamEffortUnits: {
      teamSize: '',
      monthlyPersonMonths: '',
      effortUnitPreference: 'person-weeks',
      timeHorizon: 'per-week'
    },
    customImpactLadder: {
      impactLevels: [
        { name: 'Tiny', value: 0.25, description: '≤1% lift' },
        { name: 'Small', value: 0.5, description: '1-3% lift' },
        { name: 'Medium', value: 1, description: '3-7% lift' },
        { name: 'Large', value: 2, description: '7-15% lift' },
        { name: 'Massive', value: 3, description: '>15% lift' }
      ]
    },
    confidenceRubric: {
      confidenceLevels: [
        { name: 'High', range: '0.9-1.0', description: 'A/B test or strong quantitative data' },
        { name: 'Medium', range: '0.8', description: 'Multiple customer signals' },
        { name: 'Low', range: '0.6-0.7', description: 'Soft signals or assumptions' }
      ]
    },
    constraintsRisk: {
      regulatoryConstraints: false,
      regulatoryDetails: '',
      performanceConstraints: '',
      infrastructureConstraints: '',
      riskTolerance: 'Medium'
    }
  });

  const [message, setMessage] = useState<string>('');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('pm_prioboard_product_profile');
    if (savedData) {
      try {
        setProfileData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading product profile data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever profileData changes
  useEffect(() => {
    localStorage.setItem('pm_prioboard_product_profile', JSON.stringify(profileData));
  }, [profileData]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const updateProductBasics = (field: keyof Pick<ProductProfileData, 'productName' | 'oneLiner' | 'detailedDescription'>, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNorthStarMetric = (field: keyof ProductProfileData['northStarMetric'], value: string) => {
    setProfileData(prev => ({
      ...prev,
      northStarMetric: {
        ...prev.northStarMetric,
        [field]: value
      }
    }));
  };

  const addSecondaryKPI = () => {
    const newKPI: KPI = {
      id: Date.now().toString(),
      name: '',
      value: '',
      unit: '',
      target: ''
    };
    setProfileData(prev => ({
      ...prev,
      secondaryKPIs: [...prev.secondaryKPIs, newKPI]
    }));
    showMessage('New KPI added successfully!');
  };

  const updateSecondaryKPI = (id: string, field: keyof KPI, value: string) => {
    setProfileData(prev => ({
      ...prev,
      secondaryKPIs: prev.secondaryKPIs.map(kpi =>
        kpi.id === id ? { ...kpi, [field]: value } : kpi
      )
    }));
  };

  const removeSecondaryKPI = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      secondaryKPIs: prev.secondaryKPIs.filter(kpi => kpi.id !== id)
    }));
    showMessage('KPI removed successfully!');
  };

  // Audience & Scale functions
  const updateAudienceScale = (field: keyof ProductProfileData['audienceScale'], value: string | UserSegment[]) => {
    setProfileData(prev => ({
      ...prev,
      audienceScale: {
        ...prev.audienceScale,
        [field]: value
      }
    }));
  };

  const addUserSegment = () => {
    const newSegment: UserSegment = {
      id: Date.now().toString(),
      name: '',
      size: ''
    };
    setProfileData(prev => ({
      ...prev,
      audienceScale: {
        ...prev.audienceScale,
        userSegments: [...prev.audienceScale.userSegments, newSegment]
      }
    }));
    showMessage('User segment added successfully!');
  };

  const updateUserSegment = (id: string, field: keyof UserSegment, value: string) => {
    setProfileData(prev => ({
      ...prev,
      audienceScale: {
        ...prev.audienceScale,
        userSegments: prev.audienceScale.userSegments.map(segment =>
          segment.id === id ? { ...segment, [field]: value } : segment
        )
      }
    }));
  };

  const removeUserSegment = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      audienceScale: {
        ...prev.audienceScale,
        userSegments: prev.audienceScale.userSegments.filter(segment => segment.id !== id)
      }
    }));
    showMessage('User segment removed successfully!');
  };

  // Business Context functions
  const updateBusinessContext = (field: keyof ProductProfileData['businessContext'], value: string) => {
    setProfileData(prev => ({
      ...prev,
      businessContext: {
        ...prev.businessContext,
        [field]: value
      }
    }));
  };

  // Funnel & Channels functions
  const updateFunnelChannels = (field: keyof ProductProfileData['funnelChannels'], value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      funnelChannels: {
        ...prev.funnelChannels,
        [field]: value
      }
    }));
  };

  const toggleTouchpoint = (touchpoint: string) => {
    const currentTouchpoints = profileData.funnelChannels.touchpoints;
    const newTouchpoints = currentTouchpoints.includes(touchpoint)
      ? currentTouchpoints.filter(t => t !== touchpoint)
      : [...currentTouchpoints, touchpoint];
    
    updateFunnelChannels('touchpoints', newTouchpoints);
  };

  // Baseline Volumes functions
  const updateBaselineVolumes = (field: keyof ProductProfileData['baselineVolumes'], value: string | BaselineEvent[]) => {
    setProfileData(prev => ({
      ...prev,
      baselineVolumes: {
        ...prev.baselineVolumes,
        [field]: value
      }
    }));
  };

  const addBaselineEvent = () => {
    const newEvent: BaselineEvent = {
      id: Date.now().toString(),
      name: '',
      dailyVolume: '',
      weeklyVolume: ''
    };
    setProfileData(prev => ({
      ...prev,
      baselineVolumes: {
        ...prev.baselineVolumes,
        baselineEvents: [...prev.baselineVolumes.baselineEvents, newEvent]
      }
    }));
    showMessage('Baseline event added successfully!');
  };

  const updateBaselineEvent = (id: string, field: keyof BaselineEvent, value: string) => {
    setProfileData(prev => ({
      ...prev,
      baselineVolumes: {
        ...prev.baselineVolumes,
        baselineEvents: prev.baselineVolumes.baselineEvents.map(event =>
          event.id === id ? { ...event, [field]: value } : event
        )
      }
    }));
  };

  const removeBaselineEvent = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      baselineVolumes: {
        ...prev.baselineVolumes,
        baselineEvents: prev.baselineVolumes.baselineEvents.filter(event => event.id !== id)
      }
    }));
    showMessage('Baseline event removed successfully!');
  };

  // Team & Effort Units functions
  const updateTeamEffortUnits = (field: keyof ProductProfileData['teamEffortUnits'], value: string) => {
    setProfileData(prev => ({
      ...prev,
      teamEffortUnits: {
        ...prev.teamEffortUnits,
        [field]: value
      }
    }));
  };

  // Custom Impact Ladder functions
  const updateImpactLevel = (index: number, field: keyof ImpactLevel, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      customImpactLadder: {
        ...prev.customImpactLadder,
        impactLevels: prev.customImpactLadder.impactLevels.map((level, i) =>
          i === index ? { ...level, [field]: value } : level
        )
      }
    }));
  };

  // Confidence Rubric functions
  const updateConfidenceLevel = (index: number, field: keyof ConfidenceLevel, value: string) => {
    setProfileData(prev => ({
      ...prev,
      confidenceRubric: {
        ...prev.confidenceRubric,
        confidenceLevels: prev.confidenceRubric.confidenceLevels.map((level, i) =>
          i === index ? { ...level, [field]: value } : level
        )
      }
    }));
  };

  // Constraints & Risk functions
  const updateConstraintsRisk = (field: keyof ProductProfileData['constraintsRisk'], value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      constraintsRisk: {
        ...prev.constraintsRisk,
        [field]: value
      }
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            Product Profile
          </h1>
          
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6b7280';
            }}
          >
            {/* Back Arrow Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            Back to PM PrioBoard
          </button>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '0.375rem',
          zIndex: 1000,
          fontSize: '0.875rem'
        }}>
          {message}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 2rem',
        display: 'grid',
        gap: '2rem'
      }}>
        {/* Product Basics & Metrics KPIs - Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          {/* Product Basics Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Product Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Product Basics
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Product Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Product Name
              </label>
              <input
                type="text"
                value={profileData.productName}
                onChange={(e) => updateProductBasics('productName', e.target.value)}
                placeholder="Enter your product name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#457B9D';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            {/* One-liner */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                One-liner Description
              </label>
              <input
                type="text"
                value={profileData.oneLiner}
                onChange={(e) => updateProductBasics('oneLiner', e.target.value)}
                placeholder="Brief description of what your product does"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#457B9D';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Detailed Description
              </label>
              <textarea
                value={profileData.detailedDescription}
                onChange={(e) => updateProductBasics('detailedDescription', e.target.value)}
                placeholder="Provide a comprehensive description of your product, its purpose, target audience, and key features"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#457B9D';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>
          </div>
          </div>

          {/* Metrics & KPIs Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Metrics Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
            Metrics & KPIs
          </h2>

          {/* North Star Metric */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#E63946',
              marginBottom: '1rem'
            }}>
              North Star Metric
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Metric Name
                </label>
                <input
                  type="text"
                  value={profileData.northStarMetric.name}
                  onChange={(e) => updateNorthStarMetric('name', e.target.value)}
                  placeholder="e.g., Monthly Active Users"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Current Value
                </label>
                <input
                  type="text"
                  value={profileData.northStarMetric.value}
                  onChange={(e) => updateNorthStarMetric('value', e.target.value)}
                  placeholder="1000"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Unit
                </label>
                <input
                  type="text"
                  value={profileData.northStarMetric.unit}
                  onChange={(e) => updateNorthStarMetric('unit', e.target.value)}
                  placeholder="users"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Target
                </label>
                <input
                  type="text"
                  value={profileData.northStarMetric.target}
                  onChange={(e) => updateNorthStarMetric('target', e.target.value)}
                  placeholder="5000"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#457B9D'
              }}>
                Secondary KPIs
              </h3>
              
              <button
                onClick={addSecondaryKPI}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                {/* Plus Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
                Add KPI
              </button>
            </div>

            {profileData.secondaryKPIs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                No secondary KPIs added yet. Click "Add KPI" to get started.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {profileData.secondaryKPIs.map((kpi) => (
                  <div key={kpi.id} style={{
                    display: 'grid',
                    gap: '1rem',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                    alignItems: 'end',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.375rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        KPI Name
                      </label>
                      <input
                        type="text"
                        value={kpi.name}
                        onChange={(e) => updateSecondaryKPI(kpi.id, 'name', e.target.value)}
                        placeholder="e.g., Conversion Rate"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Current Value
                      </label>
                      <input
                        type="text"
                        value={kpi.value}
                        onChange={(e) => updateSecondaryKPI(kpi.id, 'value', e.target.value)}
                        placeholder="2.5"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Unit
                      </label>
                      <input
                        type="text"
                        value={kpi.unit}
                        onChange={(e) => updateSecondaryKPI(kpi.id, 'unit', e.target.value)}
                        placeholder="%"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Target
                      </label>
                      <input
                        type="text"
                        value={kpi.target}
                        onChange={(e) => updateSecondaryKPI(kpi.id, 'target', e.target.value)}
                        placeholder="5.0"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <button
                      onClick={() => removeSecondaryKPI(kpi.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove KPI"
                    >
                      {/* Trash Icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Audience & Scale Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Users Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Audience & Scale
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Target Audience Description */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Target Audience Description
              </label>
              <textarea
                value={profileData.audienceScale.targetAudience}
                onChange={(e) => updateAudienceScale('targetAudience', e.target.value)}
                placeholder="Describe your target audience, their characteristics, needs, and behaviors"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#457B9D';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            {/* User Metrics */}
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  MAU (Monthly Active Users)
                </label>
                <input
                  type="text"
                  value={profileData.audienceScale.mau}
                  onChange={(e) => updateAudienceScale('mau', e.target.value)}
                  placeholder="e.g., 10,000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  WAU (Weekly Active Users)
                </label>
                <input
                  type="text"
                  value={profileData.audienceScale.wau}
                  onChange={(e) => updateAudienceScale('wau', e.target.value)}
                  placeholder="e.g., 3,000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Active Accounts/Organizations
                </label>
                <input
                  type="text"
                  value={profileData.audienceScale.activeAccounts}
                  onChange={(e) => updateAudienceScale('activeAccounts', e.target.value)}
                  placeholder="e.g., 500"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* User Segments */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#457B9D'
                }}>
                  Key User Segments
                </h3>
                
                <button
                  onClick={addUserSegment}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/>
                    <path d="M5 12h14"/>
                  </svg>
                  Add Segment
                </button>
              </div>

              {profileData.audienceScale.userSegments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  No user segments added yet. Click "Add Segment" to get started.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {profileData.audienceScale.userSegments.map((segment) => (
                    <div key={segment.id} style={{
                      display: 'grid',
                      gap: '1rem',
                      gridTemplateColumns: '2fr 1fr auto',
                      alignItems: 'end',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          Segment Name
                        </label>
                        <input
                          type="text"
                          value={segment.name}
                          onChange={(e) => updateUserSegment(segment.id, 'name', e.target.value)}
                          placeholder="e.g., Power Users"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          Size
                        </label>
                        <input
                          type="text"
                          value={segment.size}
                          onChange={(e) => updateUserSegment(segment.id, 'size', e.target.value)}
                          placeholder="e.g., 1,500"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <button
                        onClick={() => removeUserSegment(segment.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove Segment"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Context Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Business Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18"/>
              <path d="M5 21V7l8-4v18"/>
              <path d="M19 21V11l-6-4"/>
            </svg>
            Business Context
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {/* Industry/Domain */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Industry/Domain
              </label>
              <select
                value={profileData.businessContext.industry}
                onChange={(e) => updateBusinessContext('industry', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="ecommerce">E-commerce</option>
                <option value="media">Media & Entertainment</option>
                <option value="travel">Travel & Hospitality</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="real-estate">Real Estate</option>
                <option value="automotive">Automotive</option>
                <option value="energy">Energy</option>
                <option value="agriculture">Agriculture</option>
                <option value="government">Government</option>
                <option value="non-profit">Non-profit</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Business Model */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Business Model
              </label>
              <select
                value={profileData.businessContext.businessModel}
                onChange={(e) => updateBusinessContext('businessModel', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Business Model</option>
                <option value="saas">SaaS (Software as a Service)</option>
                <option value="subscription">Subscription</option>
                <option value="freemium">Freemium</option>
                <option value="marketplace">Marketplace</option>
                <option value="ecommerce">E-commerce</option>
                <option value="advertising">Advertising</option>
                <option value="transaction">Transaction-based</option>
                <option value="licensing">Licensing</option>
                <option value="consulting">Consulting/Services</option>
                <option value="enterprise">Enterprise Sales</option>
                <option value="platform">Platform</option>
                <option value="hybrid">Hybrid</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Product Stage */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Product Stage
              </label>
              <select
                value={profileData.businessContext.productStage}
                onChange={(e) => updateBusinessContext('productStage', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Product Stage</option>
                <option value="concept">Concept/Ideation</option>
                <option value="prototype">Prototype</option>
                <option value="mvp">MVP (Minimum Viable Product)</option>
                <option value="early-stage">Early Stage</option>
                <option value="growth">Growth Stage</option>
                <option value="mature">Mature</option>
                <option value="scale">Scale</option>
                <option value="optimization">Optimization</option>
                <option value="sunset">Sunset/Legacy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Funnel & Channels Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Funnel Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
            </svg>
            Funnel & Channels
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Main Surfaces/Touchpoints */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                Main Surfaces/Touchpoints
              </label>
              <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {[
                  'Web App',
                  'Mobile App (iOS)',
                  'Mobile App (Android)',
                  'Email',
                  'SMS/Text',
                  'Push Notifications',
                  'In-app Messages',
                  'Social Media',
                  'Website',
                  'API',
                  'Desktop App',
                  'Browser Extension'
                ].map((touchpoint) => (
                  <label key={touchpoint} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: profileData.funnelChannels.touchpoints.includes(touchpoint) ? '#f0f9ff' : '#f8fafc',
                    border: profileData.funnelChannels.touchpoints.includes(touchpoint) ? '1px solid #457B9D' : '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}>
                    <input
                      type="checkbox"
                      checked={profileData.funnelChannels.touchpoints.includes(touchpoint)}
                      onChange={() => toggleTouchpoint(touchpoint)}
                      style={{
                        width: '1rem',
                        height: '1rem',
                        accentColor: '#457B9D'
                      }}
                    />
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}>
                      {touchpoint}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rates and Metrics */}
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Exposure Rate (%)
                </label>
                <input
                  type="text"
                  value={profileData.funnelChannels.exposureRate}
                  onChange={(e) => updateFunnelChannels('exposureRate', e.target.value)}
                  placeholder="e.g., 85"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Open Rate (%)
                </label>
                <input
                  type="text"
                  value={profileData.funnelChannels.openRate}
                  onChange={(e) => updateFunnelChannels('openRate', e.target.value)}
                  placeholder="e.g., 25"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Click Rate (%)
                </label>
                <input
                  type="text"
                  value={profileData.funnelChannels.clickRate}
                  onChange={(e) => updateFunnelChannels('clickRate', e.target.value)}
                  placeholder="e.g., 12"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* User Interaction Understanding */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Understanding How Users Interact with the Product
              </label>
              <textarea
                value={profileData.funnelChannels.userInteraction}
                onChange={(e) => updateFunnelChannels('userInteraction', e.target.value)}
                placeholder="Describe user behavior patterns, common user journeys, interaction flows, and key touchpoints in the user experience"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#457B9D';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>
          </div>
        </div>

        {/* Baseline Volumes & Team Effort Units - Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          {/* Baseline Volumes Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Baseline Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M7 12l3 3 7-7"/>
            </svg>
            Baseline Volumes
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Key Events */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#457B9D'
                }}>
                  Key Events Typically Impacted
                </h3>
                
                <button
                  onClick={addBaselineEvent}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/>
                    <path d="M5 12h14"/>
                  </svg>
                  Add Event
                </button>
              </div>

              {profileData.baselineVolumes.baselineEvents.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  No baseline events added yet. Click "Add Event" to get started.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {profileData.baselineVolumes.baselineEvents.map((event) => (
                    <div key={event.id} style={{
                      display: 'grid',
                      gap: '1rem',
                      gridTemplateColumns: '2fr 1fr 1fr auto',
                      alignItems: 'end',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          Event Name
                        </label>
                        <input
                          type="text"
                          value={event.name}
                          onChange={(e) => updateBaselineEvent(event.id, 'name', e.target.value)}
                          placeholder="e.g., User Signups, Orders, Conversions"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          Daily Volume
                        </label>
                        <input
                          type="text"
                          value={event.dailyVolume}
                          onChange={(e) => updateBaselineEvent(event.id, 'dailyVolume', e.target.value)}
                          placeholder="e.g., 150"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          Weekly Volume
                        </label>
                        <input
                          type="text"
                          value={event.weeklyVolume}
                          onChange={(e) => updateBaselineEvent(event.id, 'weeklyVolume', e.target.value)}
                          placeholder="e.g., 1,050"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <button
                        onClick={() => removeBaselineEvent(event.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove Event"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Baseline Metrics */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Baseline Metrics for Measuring Impact
              </label>
              <textarea
                value={profileData.baselineVolumes.baselineMetrics}
                onChange={(e) => updateBaselineVolumes('baselineMetrics', e.target.value)}
                placeholder="Describe your baseline metrics methodology, how you measure impact, and key performance indicators used for comparison"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#457B9D';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>
          </div>
          </div>

          {/* Team & Effort Units Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Team Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Team & Effort Units
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
            {/* Team Size and Person-Months */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Team Size
              </label>
              <input
                type="text"
                value={profileData.teamEffortUnits.teamSize}
                onChange={(e) => updateTeamEffortUnits('teamSize', e.target.value)}
                placeholder="e.g., 8 people"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Monthly Person-Months Available
              </label>
              <input
                type="text"
                value={profileData.teamEffortUnits.monthlyPersonMonths}
                onChange={(e) => updateTeamEffortUnits('monthlyPersonMonths', e.target.value)}
                placeholder="e.g., 6 person-months"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr', marginTop: '1.5rem' }}>
            {/* Effort Unit Preference */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                Effort Unit Preference
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="effortUnit"
                    value="person-weeks"
                    checked={profileData.teamEffortUnits.effortUnitPreference === 'person-weeks'}
                    onChange={(e) => updateTeamEffortUnits('effortUnitPreference', e.target.value as 'person-weeks' | 'person-months')}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      accentColor: '#457B9D'
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Person-weeks</span>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="effortUnit"
                    value="person-months"
                    checked={profileData.teamEffortUnits.effortUnitPreference === 'person-months'}
                    onChange={(e) => updateTeamEffortUnits('effortUnitPreference', e.target.value as 'person-weeks' | 'person-months')}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      accentColor: '#457B9D'
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Person-months</span>
                </label>
              </div>
            </div>

            {/* Time Horizon */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                Time Horizon for Reach Calculations
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="timeHorizon"
                    value="per-week"
                    checked={profileData.teamEffortUnits.timeHorizon === 'per-week'}
                    onChange={(e) => updateTeamEffortUnits('timeHorizon', e.target.value as 'per-week' | 'per-month')}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      accentColor: '#457B9D'
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Per-week</span>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="timeHorizon"
                    value="per-month"
                    checked={profileData.teamEffortUnits.timeHorizon === 'per-month'}
                    onChange={(e) => updateTeamEffortUnits('timeHorizon', e.target.value as 'per-week' | 'per-month')}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      accentColor: '#457B9D'
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Per-month</span>
                </label>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Confidence Rubric & Constraints Risk - Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          {/* Confidence Rubric Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Confidence Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.08 2.38"/>
            </svg>
            Confidence Rubric
          </h2>

          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.375rem',
            border: '1px solid #0ea5e9'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#0369a1',
              margin: 0
            }}>
              <strong>Define confidence level criteria:</strong> Customize what evidence corresponds to each confidence level. These definitions help ensure consistent confidence scoring across all ideas.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {profileData.confidenceRubric.confidenceLevels.map((level, index) => (
              <div key={level.name} style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: '120px 100px 1fr',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Confidence Level
                  </label>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    textAlign: 'center'
                  }}>
                    {level.name}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Range
                  </label>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#457B9D',
                    textAlign: 'center'
                  }}>
                    {level.range}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Evidence Description
                  </label>
                  <input
                    type="text"
                    value={level.description}
                    onChange={(e) => updateConfidenceLevel(index, 'description', e.target.value)}
                    placeholder="e.g., A/B test or strong quantitative data"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* Constraints & Risk Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Constraints Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Constraints & Risk
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Regulatory Constraints */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <input
                  type="checkbox"
                  id="regulatoryConstraints"
                  checked={profileData.constraintsRisk.regulatoryConstraints}
                  onChange={(e) => updateConstraintsRisk('regulatoryConstraints', e.target.checked)}
                  style={{
                    width: '1rem',
                    height: '1rem',
                    accentColor: '#457B9D'
                  }}
                />
                <label htmlFor="regulatoryConstraints" style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer'
                }}>
                  Regulatory Constraints
                </label>
              </div>
              
              {profileData.constraintsRisk.regulatoryConstraints && (
                <textarea
                  value={profileData.constraintsRisk.regulatoryDetails}
                  onChange={(e) => updateConstraintsRisk('regulatoryDetails', e.target.value)}
                  placeholder="Describe specific regulatory constraints, compliance requirements, or legal considerations that impact product development"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#457B9D';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              )}
            </div>

            {/* Performance/SLO Constraints */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Performance/SLO Constraints
              </label>
              <textarea
                value={profileData.constraintsRisk.performanceConstraints}
                onChange={(e) => updateConstraintsRisk('performanceConstraints', e.target.value)}
                placeholder="Describe performance requirements, SLOs, latency constraints, or other technical performance limitations"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#457B9D';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            {/* Infrastructure Constraints */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Infrastructure Constraints
              </label>
              <textarea
                value={profileData.constraintsRisk.infrastructureConstraints}
                onChange={(e) => updateConstraintsRisk('infrastructureConstraints', e.target.value)}
                placeholder="Describe infrastructure limitations, scalability constraints, or technical debt that impacts development"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#457B9D';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            {/* Risk Tolerance */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Risk Tolerance
              </label>
              <select
                value={profileData.constraintsRisk.riskTolerance}
                onChange={(e) => updateConstraintsRisk('riskTolerance', e.target.value as 'Low' | 'Medium' | 'High')}
                style={{
                  width: '200px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="Low">Low - Conservative approach</option>
                <option value="Medium">Medium - Balanced approach</option>
                <option value="High">High - Aggressive approach</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Impact Ladder Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1D3557',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Impact Ladder Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l3 9 4-6 4 6 3-9"/>
              <path d="M21 21H3"/>
            </svg>
            Custom Impact Ladder
          </h2>

          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.375rem',
            border: '1px solid #0ea5e9'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#0369a1',
              margin: 0
            }}>
              <strong>Customize your impact scale definitions:</strong> Edit the descriptions below to match your product's specific impact measurement criteria. These definitions will be used for consistent impact scoring across all ideas.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {profileData.customImpactLadder.impactLevels.map((level, index) => (
              <div key={level.name} style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: '120px 80px 1fr',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Impact Level
                  </label>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    textAlign: 'center'
                  }}>
                    {level.name}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Value
                  </label>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#457B9D',
                    textAlign: 'center'
                  }}>
                    {level.value}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={level.description}
                    onChange={(e) => updateImpactLevel(index, 'description', e.target.value)}
                    placeholder="e.g., ≤1% lift"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={() => {
            showMessage('Product Profile saved successfully!');
            // Redirect to home after a brief delay to show the success message
            setTimeout(() => {
              onBack();
            }, 1500);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 2rem',
            backgroundColor: '#E63946',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(230, 57, 70, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(230, 57, 70, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#E63946';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(230, 57, 70, 0.2)';
          }}
        >
          {/* Save Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          Save Changes
        </button>
        
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 2rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4b5563';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 114, 128, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6b7280';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(107, 114, 128, 0.2)';
          }}
        >
          {/* Cancel Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/>
            <path d="M6 6l12 12"/>
          </svg>
          Cancel
        </button>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '1rem 0',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.875rem'
      }}>
        Made with ❤️ for product managers everywhere
      </footer>
    </div>
  );
};

export default ProductProfile;
