import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { NavController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry, DirectoryEntry, Entry } from '@ionic-native/file';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  JSON = JSON;

  public base64Photo;
  public photo;
  public photoUrls = [];
  public imageData;
  public showPhotos = true;

  constructor(
    public navCtrl: NavController,
    public camera: Camera,
    public file: File,
    public sanitizer: DomSanitizer,
  ) {

  }

  public clear() {
    this.photo = undefined;
    this.photoUrls = [];
    this.base64Photo = undefined;
    this.imageData = undefined;
  }

  public async getFileUrlOptions() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then(async (imageData) => {
      this.imageData = imageData;

      let photo = {} as any;
      this.photoUrls = [];

      try {
        const win = window as any;

        const entry = await this.file.resolveLocalFilesystemUrl(imageData) as FileEntry;
        console.log('Got entry', entry);
        photo.original = entry;
        this.photoUrls.push({
          name: 'originalPath',
          url: entry.toURL()
        });
        this.photoUrls.push({
          name: 'sanitized originalPath',
          url: this.sanitizer.bypassSecurityTrustResourceUrl(entry.toURL())
        });
        this.photoUrls.push({
          name: 'originalSplit',
          url: entry.toURL().split('//')[1]
        });
        this.photoUrls.push({
          name: 'sanitized originalSplit',
          url: this.sanitizer.bypassSecurityTrustResourceUrl(entry.toURL().split('//')[1])
        });
        this.photoUrls.push({
          name: 'ionicNativeOriginal ',
          url: win.Ionic.WebView.convertFileSrc(entry.toURL())
        });
        this.photoUrls.push({
          name: 'sanitized ionicNativeOriginal',
          url: this.sanitizer.bypassSecurityTrustResourceUrl(
            win.Ionic.WebView.convertFileSrc(entry.toURL())
          )
        });

        const photoFile = await new Promise((resolve, reject) => {
          entry.file(resolve, reject);
        });
        console.log('Got photo file', photoFile);

        const tempDirectory = await this.file.resolveLocalFilesystemUrl(this.file.tempDirectory) as DirectoryEntry;
        console.log('Got temp directory', tempDirectory);

        const newName = (new Date()).toISOString() + entry.name;

        const copyFileResult = await new Promise<Entry>((resolve, reject) => {
          return entry.copyTo(tempDirectory, newName, resolve, reject);
        });
        console.log('Copied file', copyFileResult);
        photo.copy = copyFileResult;
        this.photoUrls.push({ name: 'copyNative', url: copyFileResult.nativeURL });
        this.photoUrls.push({ name: 'copyNativeSplit', url: copyFileResult.nativeURL.split('//')[1] });
        this.photoUrls.push({ name: 'ionicNativeCopy', url: win.Ionic.WebView.convertFileSrc(copyFileResult.nativeURL) });

      } catch (err) {
        console.log('Camera error inside promise: ', err);
      } 
      this.photo = photo;

      console.log('Image data', imageData);
      console.log('Photo', this.photo);
    }, (err) => {
      console.log('Camera error: ', err);
    });
  }

  public async getBase64FromCamera() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then(async (imageData) => {
      this.imageData = imageData;

      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.base64Photo = 'data:image/jpeg;base64,' + imageData;
      console.log('Image data', imageData);
      console.log('base64', this.base64Photo);
    }, (err) => {
      console.log('Camera error: ', err);
    });
  }

}
