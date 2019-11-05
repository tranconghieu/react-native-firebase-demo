import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
 AsyncStorage ,
 Alert
} from 'react-native';

import firebase from 'react-native-firebase'

export default class App extends Component {
  // lấy được cấp quyền chúng ta sẽ lấy Fcm Token về ( như id của mỗi thiết bị ) lưu vào AsynStorage
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log("before fcmToken: ", fcmToken);
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        console.log("after fcmToken: ", fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  };
  // hàm yêu cầu cấp quyền
  async requestPermission() {
    
    firebase.messaging().requestPermission()
      .then(() => {
        this.getToken();
      })
      .catch(error => {
        console.log('permission rejected');
      });
  };
  // kiểm tra đã có  quyền chưa nếu chưa thì yêu cầu cấp , đã có thì getTokent()
  async checkPermission() {
    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          console.log("Permission granted");
          this.getToken();
        } else {
          console.log("Request Permission");
          this.requestPermission();
        }
      });
  }
  messageListener = async () => {
    
    // tao từ android 8.0  trở lên phải tạo chanel mới hiện đc notification
    // const channel = new firebase.notifications.Android.
    // Channel('test-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
    //  .setDescription('My apps test channel')
     
    //  console.log('my chanel id = ', channel);
    // firebase.notifications()
    // .android.createChannel(channel)
    

    // bắt sự kiện gửi notification khi nguoi dung dang online
    this.notificationListener = firebase.notifications().onNotification((notification) => {

        const { title, body } = notification;
        this.showAlert(title, body);
    });
  
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      debugger
        const { title, body } = notificationOpen.notification;
        console.log('opent notification',notificationOpen.notification);
        this.showAlert(title, body);
    });
  

    // nhâp vào thông báo ở màn hình chính khi app đang offline
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      debugger;
      console.log('getInitial Notification',notificationOpen.notification.data);
      
        const { title, body } = notificationOpen.notification.data;
        this.showAlert(title, body);
    }
  
    this.messageListener = firebase.messaging().onMessage((message) => {
      
      console.log(JSON.stringify(message));
    });
  }
  async componentDidMount(){

    this.checkPermission();
    this.messageListener();

  }
  showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      {cancelable: false},
    );
  }
  render() {
    return (
      <View>
        <Text> Hi every one , My name hieu  </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({

});

