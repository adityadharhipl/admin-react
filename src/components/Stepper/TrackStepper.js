import React from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import "./stepper.css";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 9,
        left: 'calc(-50% + 4px)',
        right: 'calc(50% + 4px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            background: '#3BB77E',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            background: '#3BB77E',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 6,
        border: 0,
        backgroundColor: '#eaeaf0',
        borderRadius: 1,
    },
}));

const ColorlibStepIconRoot = styled('div')(({ ownerState }) => ({
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 23,
    height: 23,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState?.active && {
        background: '#3BB77E',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        border: '3px solid #fff',
        outline: '1px solid #3BB77E',
    }),
    ...(ownerState?.completed && {
        background: '#3BB77E',
    }),
}));

function ColorlibStepIcon(props) {
    const { active, completed, className } = props;
    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {/* Render the step icon */}
        </ColorlibStepIconRoot>
    );
}

const steps = [
    { title: 'Step 1', subTitle: 'Step 1' },
    { title: 'Step 2', subTitle: 'Step 2' },
    { title: 'Step 3', subTitle: 'Step 3' },
    { title: 'Step 4', subTitle: 'Step 4' },
    { title: 'Step 5', subTitle: 'Step 5' },
    { title: 'Step 6', subTitle: 'Step 6' },
    { title: 'Step 7', subTitle: 'Step 7' },
    { title: 'Step 8', subTitle: 'Step 8' },
];

function StepData({ title, subTitle }) {
    return (
        <div className="stepperTitle_Box">
            <h5>{title}</h5>
        </div>
    );
}

export default function TrackStepper(props) {
    return (
        <Stack sx={{ width: '100%' }} spacing={4} className="stepper_bar">
            <Stepper alternativeLabel activeStep={props?.steps} connector={<ColorlibConnector />}>
                {steps.map((item, i) => (
                    <Step key={i} onClick={() => props?.handleSteps(i, 'steps')}>
                        <StepLabel StepIconComponent={ColorlibStepIcon}>
                            <StepData {...item} />
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Stack>
    );
}
