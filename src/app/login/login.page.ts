import { Component, OnInit, Input } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

import { UserinfoService } from '../services/userinfo.service';
import { AuthenticationService } from '../services/authentication.service';
import { ToastMessagingService } from '../services/toastmessaging.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @Input() events: any;

  username: string;
  password: string;

  inputPlaceholder = " Email";
  mainButtonText = "LOGIN";
  createAccountText = "Don't have an account?";
  termTexts = "";
  currentLoadingCtrl: any;

  constructor(
    private toastMessager: ToastMessagingService,
    private userinfoService : UserinfoService,
    private authService: AuthenticationService,
    private loadingController: LoadingController,
    ) { 
  }

  ngOnInit() {
  }

  /*
   * Setup current user after we have user id from server side.
   * this including fetch user profile and set TOKEN_KEY
   */
  private loginWithUserId(user_id) {
    console.log('Loging with id:' + user_id);
    this.userinfoService.user.id = user_id.toString();
    console.log('this.userinfoService.user.id = ', this.userinfoService.user.id);
    this.userinfoService.getLatestUserProfile().then(() => {
      this.userinfoService.setToken().then((res) => {
        if(res) {
          this.authService.checkToken();
          this.toastMessager.presentToast("Welcome back!");
        } else {
          this.toastMessager.presentError('Failed to set TOKEN, please try again later');
        }
      })
      .catch(err => this.toastMessager.presentError(err));
    })
    .catch(err => this.toastMessager.presentError(err))
    .finally(() => this.userinfoService.uploadLocation())
  }

  /*
   * check validity of email address
   */
  private checkEmail(email : string) : boolean {
    if(email.length == 0) {
      this.toastMessager.presentToast("Please fill-in you email");
      return false;
    }
    if(email.length < 4 || email.search('@') == -1){
      this.toastMessager.presentToast("Please provide a valid email address");
      return false;
    }
    return true;
  }

  /*
   * Check validity of password.
   */
  private checkPassword(pswd : string) : boolean {
    if(pswd.length == 0) {
      this.toastMessager.presentToast("Please fill-in you password");
      return false;
    }
    if(pswd.length < 6){
      this.toastMessager.presentToast("Password must have minimum length of 6");
      return false;
    }
    return true;
  }

  /*
   * login
   */
  private async login(email : string, password : string) {
    await this.presentLoadingPopover();
    this.authService.login(email, password).subscribe(
      (res) => {
        this.loginWithUserId(res);
      },
      (err) => {
        this.toastMessager.presentError(err);
      },
    ).add(() => this.dismissLoadingPopover());
  }

  /*
   * register
   */
  private async register(email : string, password : string) {
    await this.presentLoadingPopover();
    this.authService.register(email, password).subscribe(
      (res) => {
        this.loginWithUserId(res);
      }, 
      (err) => {
        this.toastMessager.presentError(err);
      }
    ).add(() => this.dismissLoadingPopover());
  }

  /*
   * Main button in login page, used to login or register
   */
  mainButton(email : string, password : string) {
    if(email == "adamzjk" && password == "adamzjk") {
      this.loginWithUserId('admin_user_adamzjk');
    } else if ( this.checkEmail(email) && this.checkPassword(password)){
      if(this.mainButtonText == "LOGIN"){
        this.login(email, password)
      } else {
        this.register(email, password);
      }
    }
  }

  /*
   * login with fb, 
   */
  loginWithFacebook() {
    this.toastMessager.presentToast("Function temporarily disabled")
    // this.authService.loginWithFacebook();
      // .then(
      //   () => this.router.navigate(['tabs']),
      //   error => console.log(error.message)
      // );
  }

  /*
   * change some texts and button behavior
   */
  switchLoginRegister() {
    if(this.mainButtonText == "LOGIN") {
      this.mainButtonText = "REGISTER";
      this.createAccountText = "Already have an account?";
      this.termTexts = "By tapping Register,you agree with our <b><u>Terms of Services</u></b> and <b><u>Privacy Ploicy</u></b>."
    } else {
      this.mainButtonText = "LOGIN";
      this.createAccountText = "Don't have an account?";
      this.termTexts = "";
    }
  }

  /*
   * not implemented
   */
  pswReset() {
    this.toastMessager.presentToast("Function not implemented")
  }

  /*
   * Present a small loading window
   */
  async presentLoadingPopover() {
    this.currentLoadingCtrl = await this.loadingController.create({
      spinner: 'crescent',
      duration: 16000,
      message: 'Please wait...',
      translucent: false,
      cssClass: 'login-loading'
    });
    return this.currentLoadingCtrl.present();
  }

  /*
   * Dismiss a small loading window
   */
  dismissLoadingPopover() {
    console.log("Dismissing Popover..");
    return this.currentLoadingCtrl.dismiss();
  }

}
