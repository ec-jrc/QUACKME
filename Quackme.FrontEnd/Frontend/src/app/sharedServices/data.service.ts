import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { determinateStep } from './stepsConaitener';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const urlAdress = 'http://localhost:8080';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public filesObject;
  public filesObjectStatus;
  public timeInterval = 1000 * 60 * 5; // 5min

  constructor(
    private http: HttpClient,
  ) {
  }

  public getServerStatus() {
    const header = this.httpClientHeader();
    return this.http.get(`${urlAdress}/flows/status`, { ...header, observe: 'response' });
  }

  public getServerStatusFromDate(dateObj) {
    const header = this.httpClientHeader();
    return this.http.get(`${urlAdress}/flows/status/date/${dateObj}`, { ...header });
  }

  public getSelectedFlowStatus(flowId) {
    const selectedFlow = flowId.flowId;
    const header = this.httpClientHeader();
    return this.http.get(`${urlAdress}/flows/status/${selectedFlow}`, { ...header, observe: 'response' });
  }

  public getFilesObject(flowId) {
    const selectedFlow = flowId.flowId;
    const header = this.httpClientHeader();
    return this.http.get(`${urlAdress}/flows/${selectedFlow}`, header);
  }

  public getSelectedFile(file) {
    const flowId = escape(file.flowId);
    const header = this.httpClientHeader();
    return this.http.get(`${urlAdress}/flows/${flowId}/files/${file.selectedFile}/${file.referenceDates.join()}`, header);
  }

  public putNewAlertData(alert) {
    const flowId = escape(alert.file.flowId);
    const header = this.httpClientHeader();
    return this.http.put(`${urlAdress}/flows/${flowId}/files/${alert.file.selectedFile}`, alert.file.values, header);
  }

  public sendAcceptedFile(file) {
    const flowId = file.selectedFiles.flowId;
    const step = determinateStep(file.selectedFiles.checkLevel, file.action);
    const header = this.httpClientHeader();
    return this.http.post(`${urlAdress}/flows/${escape(flowId)}/${step}`, {}, header);
  }

  public getFlowsIds(region) {
    let regionName = region;
    if (region === undefined) {
      regionName = 'EUR';
    }
    const header = this.httpClientHeader();
    return this.http.get(`${urlAdress}/flows?region=${regionName}`, header);
  }

  public getFlowsIdsFromDate(region, startDate, endDate) {
    let regionName = region;
    if (region === undefined) {
      regionName = 'EUR';
    }
    const header = this.httpClientHeader();
    return this.http.get(`${urlAdress}/flows/${regionName}/${startDate}/${endDate}`, header);
  }

  public sendFileToServer(form) {
    const header = this.httpClientHeader();
    return this.http.post(`${urlAdress}/file`, form, { ...header, observe: 'response' });
  }

  public httpClientHeader() {
    const token: string = localStorage.getItem('access_token');
    const headers: HttpHeaders = new HttpHeaders();//`Authorization: Bearer ${token}`);
    return { headers };
  }
}
