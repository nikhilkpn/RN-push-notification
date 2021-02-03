import { StatusBar } from 'expo-status-bar';
import React,{useEffect, useState} from 'react';
import { StyleSheet,Button, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'

// add "useNextNotificationApi": true in app.json for android
// need to request permission for IOS


// show notification whilst the app is open
Notifications.setNotificationHandler({
  handleNotification: async ()=>{
    return {
      shouldShowAlert:true,
      shouldPlaySound:true
    }
  }
})

export default function App() {
  const [pushToken, setPushToken] = useState()
  useEffect(()=>{
    Permissions.getAsync(Permissions.NOTIFICATIONS).then(statusObj=>{
      if (statusObj.status !== 'granted'){
        return Permissions.askAsync(Permissions.NOTIFICATIONS)
      }
      // already has permission , so return to next 'then' promise
      return statusObj;
    }).then(statusObj =>{
      // even after asking the permission if user deny it leave him alone
      if (statusObj.status !=='granted'){
        throw new Error('Permission denied')

      }
    })
    .then(()=>{
      return Notifications.getExpoPushTokenAsync()
    })
    .then(response =>{
      const token = response.data;
      setPushToken(token)
    })
  },[])

  useEffect(()=>{
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(noti=>{
      console.log(noti);
    }

    )
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification=>{
      console.log(notification);
    })
    return ()=>{
      foregroundSubscription.remove()
      backgroundSubscription.remove()
    }
  },[])
  const notificationHandler = () =>{
    /*
    // for manually triggering local notification

    Notifications.scheduleNotificationAsync({
        content:{
          title:'My notification',
          body:'Notification content'
        },
        trigger:{
          seconds:5
        }
      })
    
    */
   const message = {
    to: pushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  }
  return (
    <View style={styles.container}>
      <Button title='Triger notification' onPress={notificationHandler}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
