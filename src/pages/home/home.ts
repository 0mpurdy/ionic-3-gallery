import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { NavController, Platform } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry, DirectoryEntry, Entry } from '@ionic-native/file';

interface StoredPhoto {
  source: string;
}

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
    public camera: Camera,
    public file: File,
    public navCtrl: NavController,
    public platform: Platform,
    public sanitizer: DomSanitizer,
  ) {

  }

  ngOnInit() {

    this.platform.ready().then(() => {
      const storedPhotosString = localStorage.getItem('photos') as any;
      let storedPhotos: StoredPhoto[] = [];
      if (storedPhotosString) {
        storedPhotos = JSON.parse(storedPhotosString) as StoredPhoto[];
        if (storedPhotos.length > 0) {
          this.photo = storedPhotos[0];
          this.resolveLink(storedPhotos[0].source);
        }
      }
    });

  }

  public clear() {
    this.photo = undefined;
    this.photoUrls = [];
    this.base64Photo = undefined;
    this.imageData = undefined;
  }

  public async getNativeFileUrlOptions() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.NATIVE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then(this.handleCameraResponse() , (err) => {
      console.log('Camera error: ', err);
    });
  }

  public async getFileUrlOptions() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then(this.handleCameraResponse() , (err) => {
      console.log('Camera error: ', err);
    });
  }

  public handleCameraResponse() {
    return async (imageData) => {
      this.imageData = imageData;
      let photo = {};
      this.photoUrls = [];
      try {
        photo = this.resolveLink(imageData);
      } catch (err) {
        console.log('Camera error inside promise: ', err);
      } 
      this.photo = photo;
      localStorage.setItem('photos', JSON.stringify([{ source: imageData }]));

      console.log('Image data', imageData);
      console.log('Photo', this.photo);
    };
  }

  public async resolveLink(link: string) {
    let photo = {} as any;

    console.log('Attempting to resolve: ', link);
    const entry = await this.file.resolveLocalFilesystemUrl(link) as FileEntry;
    console.log('Got entry', entry);
    photo.original = entry;
    this.pushAllUrls('Original', entry.toURL());
    this.pushAllUrls('Original Split', entry.toURL().split('//')[1]);

    const photoFile = await new Promise((resolve, reject) => {
      entry.file(resolve, reject);
    });
    console.log('Got photo file', photoFile);

    const tempDirectory = await this.file.resolveLocalFilesystemUrl(this.file.tempDirectory) as DirectoryEntry;
    console.log('Got temp directory', tempDirectory);

    let newName = (new Date()).toISOString();
    newName = newName.replace(/[:\.]/g, '');
    newName = newName + '.jpg';
    console.log('New name', newName);

    const copyFileResult = await new Promise<Entry>((resolve, reject) => {
      entry.copyTo(tempDirectory, newName, resolve, reject);
    });
    console.log('Copied file', copyFileResult);

    photo.copy = copyFileResult;
    this.pushAllUrls('Copy native', copyFileResult.nativeURL);
    this.pushAllUrls('Copy native split', copyFileResult.nativeURL.split('//')[1]);

    return photo;
  }

  public pushAllUrls(name: string, url: string) {
    this.photoUrls.push({
      name,
      url,
    });
    this.pushSanitisedUrls(name, url);

    const win = window as any;
    const ionicUrlName = 'Ionic format ' + name;
    const ionicUrl = win.Ionic.WebView.convertFileSrc(url);
    this.photoUrls.push({
      name: ionicUrlName,
      url: ionicUrl,
    });
    this.pushSanitisedUrls(ionicUrlName, ionicUrl);
  }

  public pushSanitisedUrls(name: string, url: string) {
    this.photoUrls.push({
      name: 'Sanitised resource ' + name,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(url),
    });
    this.photoUrls.push({
      name: 'Sanitised url ' + name,
      url: this.sanitizer.bypassSecurityTrustUrl(url),
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
