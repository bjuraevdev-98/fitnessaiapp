import { Box, Button, duration, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React from 'react'
import { addActivity } from '../services/api';


const ActivityForm = ( { onActivityAdded } ) => {

    const [activity, setActivity] = React.useState({
        type: 'RUNNING',
        duration: '',
        caloriesBurned: '',
        additionalMetrics: {}
    });

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await addActivity(activity);
        onActivityAdded();
        setActivity({ type: 'RUNNING', duration: '', caloriesBurned: '' });
    } catch (error) {
        console.error('Error adding activity:', error);
    }
}


  return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mg: 4 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel htmlFor="activity-type">Activity Type</InputLabel>
                <Select
                    value={activity.type}
                    onChange={(e) => setActivity({ ...activity, type: e.target.value })}>
                        <MenuItem value="RUNNING">Running</MenuItem>
                        <MenuItem value="CYCLING">Cycling</MenuItem>
                        <MenuItem value="WALKING">Walking</MenuItem>
                </Select>
            </FormControl>

            <TextField fullWidth
                        label="Duration (minutes)"
                        type="number"
                        sx={{ mb: 2 }}
                        value={activity.duration}
                        onChange={(e) => setActivity({ ...activity, duration: e.target.value })}
                />

            <TextField fullWidth
                        label="Calories Burned"
                        type="number"
                        sx={{ mb: 2 }}
                        value={activity.caloriesBurned}
                        onChange={(e) => setActivity({ ...activity, caloriesBurned: e.target.value })}
                />
            <Button type="submit" variant="contained" sx={{mb: 2}}>Add Activity</Button>
        </Box>
  )
}

export default ActivityForm