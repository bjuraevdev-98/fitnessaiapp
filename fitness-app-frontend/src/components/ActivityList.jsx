import { Card, CardContent, Grid, Typography } from '@mui/material'
import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router';
import { getActivities } from '../services/api';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <Grid container spacing={2}>
      {activities.map((activity) => (
        <Grid item xs={12} key={activity.id} onClick={() => navigate(`/activities/${activity.id}`)}>
          <Card sx={{cursor: 'pointer'}}
                onClick={() => navigate(`/activities/${activity.id}`)}>
                  <CardContent>
                    <Typography variant="h6">{activity.type}</Typography>
                    <Typography variant="body2">Duration: {activity.duration} mins</Typography>
                    <Typography variant="body2">Calories Burned: {activity.caloriesBurned}</Typography>
                  </CardContent>
          </Card>
        </Grid>
      ))}          
    </Grid>
  )
}

export default ActivityList