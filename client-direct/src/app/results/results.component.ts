import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, NavigationStart } from '@angular/router';
// rxjs/operators === pipeable operators
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ColorHelper } from '@swimlane/ngx-charts';
import { switchMap, takeUntil, catchError, map, concatMap, filter } from 'rxjs/operators';
// https://stackoverflow.com/questions/50229130/how-to-import-rxjs-timer-in-angular-6
import { Observable, timer, interval, of } from 'rxjs';

import { AppredictConfigService } from '../appredict-config.service';
import { ApPredictInput, AssociatedItem } from '../ap-predict-input';
import { ApPredictOutput, DataType } from '../ap-predict-output';
import { AppRoutingModule } from '../app-routing.module';
import { SimulationService } from '../service/simulation.service';
import { Model } from '../model';

import { displayData, AssociatedItemType, LocalStorageItem } from '../utility-functions';

enum VoltageResultsType {
  APD50,
  APD90,
  DELTA_APD90,
  PEAK_VM,
  UPSTROKE_VELOCITY
}

class ChartData {

  private _dataTitle: string;
  private _legendTitle: string;

  private _xAxisLabel: string;
  private _yAxisLabel: string;

  private _yScaleMin: number;
  private _yScaleMax: number;
  private _xScaleMin: number;
  private _xScaleMax: number;

  constructor(type: VoltageResultsType) {
    this._legendTitle = 'Simulation';
    this._dataTitle = '@ ';

    this._xAxisLabel = 'Concentration (µM)';

    this._xScaleMin = -3;
    this._xScaleMax = 3;

    switch (type) {
      case VoltageResultsType.APD50:
        this._yAxisLabel = 'APD50 (ms)';
        this._yScaleMin = 100;
        this._yScaleMax = 400;
        break;
      case VoltageResultsType.APD90:
        this._yAxisLabel = 'APD90 (ms)';
        this._yScaleMin = 100;
        this._yScaleMax = 500;
        break;
      case VoltageResultsType.DELTA_APD90:
        this._yAxisLabel = 'Δ APD90 (%)';
        this._yScaleMin = -20;
        this._yScaleMax = 20;
        break;
      case VoltageResultsType.PEAK_VM:
        this._yAxisLabel = 'Peak Vm (mV)';
        this._yScaleMin = 40;
        this._yScaleMax = 60;
        break;
      case VoltageResultsType.UPSTROKE_VELOCITY:
        this._yAxisLabel = 'Upstroke Velocity (mV/ms)';
        this._yScaleMin = 250;
        this._yScaleMax = 450;
        break;
      default :
        break;
    }
  }

  get dataTitle(): string {
    return this._dataTitle;
  }
  get legendTitle(): string {
    return this._legendTitle;
  }

  get xScaleMin(): number {
    return this._xScaleMin;
  }
  get xScaleMax(): number {
    return this._xScaleMax;
  }
  get yScaleMin(): number {
    return this._yScaleMin;
  }
  get yScaleMax(): number {
    return this._yScaleMax;
  }

  get xAxisLabel(): string {
    return this._xAxisLabel;
  }
  get yAxisLabel(): string {
    return this._yAxisLabel;
  }

  set yScaleMin(yScaleMin: number) {
    if (yScaleMin < this._yScaleMin) {
      this._yScaleMin = yScaleMin;
    }
  }
  set yScaleMax(yScaleMax: number) {
    if (yScaleMax > this._yScaleMax) {
      this._yScaleMax = yScaleMax;
    }
  }
  set xScaleMin(xScaleMin: number) {
    if (xScaleMin < this._xScaleMin) {
      this._xScaleMin = xScaleMin;
    }
  }
  set xScaleMax(xScaleMax: number) {
    if (xScaleMax > this._xScaleMax) {
      this._xScaleMax = xScaleMax;
    }
  }
}

const jobDone: string = ' Job done! ';

/**
 * Results component for displaying simulation results.
 */
@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.sass']
})


export class ResultsComponent implements OnInit, OnDestroy {
  simulationId: string;
  ipAddress: string;
  apPredictInput: ApPredictInput;
  modelName: string;
  modelDescription: string;

  configModels: Model[] = [];

  status: string;

  polledBitcoin: string;
  errorMessage: string;
  progressMessage: string;
  stdErr: string;
  stdOut: string;
  vtMessage: string;
  myTimer;

  completed: boolean = false;
  shown: boolean = false;

  showAllData: boolean = false;

  titleHide: string = 'Hide';
  titleShow: string = 'Show';
  titleStdErr: string = 'stderr';
  titleStdOut: string = 'stdout';
  showHideStdErr: string = this.titleShow;
  showHideStdOut: string = this.titleShow;
  showStdErr: boolean = false;
  showStdOut: boolean = false;

  toggled: boolean = true;
  currEnumIdx: number = -1;
  allVoltageResultsData: any;

  vrGraphTitle: string = '';
  vrLegendTitle: string;
  vrXAxisTicks: any[] = [];
  vrXAxisLabel: string;
  vrYAxisLabel: string;
  vrXScaleMin: number;
  vrXScaleMax: number;
  vrYScaleMin: number;
  vrYScaleMax: number;
  vrXAxisTickFormattingFn = this.xAxisTickFormatting.bind(this);

  view: any[] = [700, 400];

  yDomain = [-100, 100];
  schemeType: any;

  colors: ColorHelper;
  getColors() {
    this.colors = new ColorHelper(this.colorScheme, this.schemeType, this.yDomain);
  }

  colorScheme = {
    domain: [
      '#00ff88', '#22aadd', '#bb44cc', '#6699ee', '#887700', '#aa5522', '#cc3344', '#ee1166', '#ff8800', '#ddaaee', '#bbcccc', '#99eeaa', '#770088', '#55bb66'
    ]
  }

  vrColorScheme = this.colorScheme;

  /*
  multi: any[] = [{name:'0',series:[{name:-5,value:-85.4171},{name:0,value:-85.4176},{name:0.1,value:-80.259},{name:0.2,value:-75.162},{name:0.3,value:-70.112},{name:0.4,value:-65.0771},{name:0.5,value:-59.9728},{name:0.6,value:-54.5091},{name:0.7,value:-47.6557},{name:0.8,value:-35.7464},{name:0.9,value:-7.29255},{name:1,value:23.4743},{name:1.1,value:33.498},{name:1.2,value:36.6414},{name:1.6,value:35.898},{name:1.7,value:35.089},{name:1.8,value:34.2327},{name:1.9,value:33.3557},{name:2,value:32.4769},{name:2.1,value:31.6104},{name:2.2,value:30.7673},{name:2.3,value:29.9557},{name:2.4,value:29.1818},{name:2.5,value:28.4499},{name:2.6,value:27.7628},{name:2.7,value:27.1221},{name:2.8,value:26.5281},{name:2.9,value:25.9803},{name:3.1,value:25.0163},{name:3.2,value:24.5962},{name:3.4,value:23.8693},{name:3.5,value:23.5579},{name:3.9,value:22.5907},{name:4,value:22.3995},{name:4.5,value:21.4165},{name:4.6,value:21.1602},{name:4.9,value:20.3008},{name:5,value:20.0085},{name:5.3,value:19.1797},{name:5.4,value:18.9268},{name:5.8,value:18.0487},{name:5.9,value:17.8618},{name:6.6,value:16.8631},{name:6.7,value:16.7583},{name:14.5,value:17.7524},{name:14.6,value:17.7955},{name:16.9,value:18.7763},{name:17,value:18.8182},{name:19.4,value:19.7979},{name:19.5,value:19.8375},{name:22.1,value:20.8356},{name:22.2,value:20.8728},{name:24.9,value:21.8556},{name:25,value:21.8913},{name:27.9,value:22.8694},{name:28,value:22.9},{name:31.9,value:23.8929},{name:32,value:23.9134},{name:39.8,value:24.9096},{name:39.9,value:24.9162},{name:50,value:25.1503},{name:60.1,value:24.948},{name:70.2,value:24.5833},{name:80.3,value:24.1175},{name:90.4,value:23.5593},{name:100.5,value:22.9091},{name:110.6,value:22.1675},{name:120.7,value:21.3347},{name:130.7,value:20.4192},{name:140.6,value:19.4199},{name:140.7,value:19.4093},{name:149.7,value:18.4133},{name:149.8,value:18.4017},{name:158,value:17.4139},{name:158.1,value:17.4013},{name:165.7,value:16.4088},{name:165.8,value:16.3952},{name:172.8,value:15.4065},{name:172.9,value:15.3919},{name:179.4,value:14.4008},{name:179.5,value:14.385},{name:185.5,value:13.399},{name:185.6,value:13.3819},{name:191.2,value:12.3911},{name:191.3,value:12.3728},{name:196.5,value:11.3835},{name:196.6,value:11.3637},{name:201.4,value:10.3833},{name:201.5,value:10.3621},{name:206,value:9.37668},{name:206.1,value:9.35401},{name:210.3,value:8.36935},{name:210.4,value:8.3451},{name:214.3,value:7.36809},{name:214.4,value:7.34221},{name:218.1,value:6.35343},{name:218.2,value:6.32583},{name:221.7,value:5.32948},{name:221.8,value:5.30011},{name:225.1,value:4.30134},{name:225.2,value:4.27015},{name:228.3,value:3.27506},{name:228.4,value:3.24202},{name:231.3,value:2.25752},{name:231.4,value:2.22264},{name:234.1,value:1.25622},{name:234.2,value:1.2195},{name:236.8,value:0.240464},{name:236.9,value:0.201855},{name:239.4,value:-0.787409},{name:239.5,value:-0.827965},{name:241.9,value:-1.82524},{name:242,value:-1.86782},{name:244.2,value:-2.8266},{name:244.3,value:-2.87122},{name:246.4,value:-3.83029},{name:246.5,value:-3.87705},{name:248.5,value:-4.83474},{name:248.6,value:-4.88379},{name:250.5,value:-5.83847},{name:250.6,value:-5.88996},{name:252.4,value:-6.83983},{name:252.5,value:-6.89394},{name:254.3,value:-7.89372},{name:254.4,value:-7.95077},{name:256.1,value:-8.94672},{name:256.2,value:-9.00691},{name:257.8,value:-9.996},{name:257.9,value:-10.0595},{name:259.4,value:-11.0378},{name:259.5,value:-11.1048},{name:260.9,value:-12.0672},{name:261,value:-12.1377},{name:262.3,value:-13.0783},{name:262.4,value:-13.1525},{name:263.7,value:-14.1422},{name:263.8,value:-14.2203},{name:265,value:-15.1807},{name:265.1,value:-15.2627},{name:266.2,value:-16.1854},{name:266.3,value:-16.2712},{name:267.4,value:-17.2367},{name:267.5,value:-17.3265},{name:268.5,value:-18.2431},{name:268.6,value:-18.3367},{name:269.6,value:-19.2918},{name:269.7,value:-19.3893},{name:270.7,value:-20.384},{name:270.8,value:-20.4855},{name:271.7,value:-21.4156},{name:271.8,value:-21.5208},{name:272.7,value:-22.4844},{name:272.8,value:-22.5934},{name:273.7,value:-23.591},{name:273.8,value:-23.7037},{name:274.6,value:-24.6194},{name:274.7,value:-24.7356},{name:275.5,value:-25.6788},{name:275.6,value:-25.7984},{name:276.4,value:-26.7693},{name:276.5,value:-26.8924},{name:277.3,value:-27.8909},{name:277.4,value:-28.0175},{name:278.1,value:-28.9144},{name:278.2,value:-29.044},{name:278.9,value:-29.9628},{name:279,value:-30.0956},{name:279.7,value:-31.0366},{name:279.8,value:-31.1726},{name:280.5,value:-32.1362},{name:280.6,value:-32.2755},{name:281.3,value:-33.2622},{name:281.4,value:-33.4048},{name:282,value:-34.2697},{name:282.1,value:-34.4154},{name:282.7,value:-35.2989},{name:282.8,value:-35.4477},{name:283.4,value:-36.3504},{name:283.5,value:-36.5025},{name:284.1,value:-37.4254},{name:284.2,value:-37.5809},{name:284.8,value:-38.525},{name:284.9,value:-38.6842},{name:285.5,value:-39.6507},{name:285.6,value:-39.8137},{name:286.2,value:-40.804},{name:286.3,value:-40.9711},{name:286.8,value:-41.816},{name:286.9,value:-41.9868},{name:287.4,value:-42.8509},{name:287.5,value:-43.0257},{name:288,value:-43.91},{name:288.1,value:-44.0889},{name:288.6,value:-44.9947},{name:288.7,value:-45.1781},{name:289.2,value:-46.1065},{name:289.3,value:-46.2946},{name:289.8,value:-47.2469},{name:289.9,value:-47.4398},{name:290.4,value:-48.4171},{name:290.5,value:-48.6151},{name:290.9,value:-49.4159},{name:291,value:-49.6184},{name:291.4,value:-50.4369},{name:291.5,value:-50.6438},{name:291.9,value:-51.4805},{name:292,value:-51.6919},{name:292.4,value:-52.5467},{name:292.5,value:-52.7626},{name:292.9,value:-53.6353},{name:293,value:-53.8556},{name:293.4,value:-54.7457},{name:293.5,value:-54.9703},{name:293.9,value:-55.8768},{name:294,value:-56.1053},{name:294.4,value:-57.0268},{name:294.5,value:-57.2589},{name:294.9,value:-58.1933},{name:295,value:-58.4283},{name:295.4,value:-59.3731},{name:295.5,value:-59.6103},{name:295.9,value:-60.5621},{name:296,value:-60.8006},{name:296.4,value:-61.7556},{name:296.5,value:-61.9944},{name:296.9,value:-62.9481},{name:297,value:-63.186},{name:297.4,value:-64.1336},{name:297.5,value:-64.3693},{name:297.9,value:-65.3055},{name:298,value:-65.5376},{name:298.4,value:-66.4572},{name:298.5,value:-66.6845},{name:298.9,value:-67.5821},{name:299,value:-67.8034},{name:299.4,value:-68.6742},{name:299.5,value:-68.8882},{name:299.9,value:-69.7278},{name:300,value:-69.9335},{name:300.4,value:-70.7382},{name:300.5,value:-70.9348},{name:301,value:-71.8882},{name:301.1,value:-72.073},{name:301.6,value:-72.9657},{name:301.7,value:-73.138},{name:302.3,value:-74.1275},{name:302.4,value:-74.2851},{name:303,value:-75.186},{name:303.1,value:-75.3288},{name:303.8,value:-76.2716},{name:303.9,value:-76.3983},{name:304.7,value:-77.3428},{name:304.8,value:-77.4526},{name:305.7,value:-78.3624},{name:305.8,value:-78.4552},{name:307,value:-79.4528},{name:307.1,value:-79.5269},{name:308.6,value:-80.4941},{name:308.7,value:-80.5498},{name:310.8,value:-81.5161},{name:310.9,value:-81.5536},{name:314.5,value:-82.5404},{name:314.6,value:-82.5598},{name:324.7,value:-83.5051},{name:334.8,value:-83.7749},{name:344.9,value:-83.9414},{name:355,value:-84.0833},{name:365.1,value:-84.2116},{name:375.2,value:-84.3283},{name:385.3,value:-84.4341},{name:395.4,value:-84.5295},{name:405.5,value:-84.6154},{name:415.6,value:-84.6924},{name:425.7,value:-84.7614},{name:435.8,value:-84.8232},{name:445.9,value:-84.8786},{name:456,value:-84.9282},{name:466.1,value:-84.9727},{name:476.2,value:-85.0126},{name:486.3,value:-85.0485},{name:496.4,value:-85.0808},{name:506.5,value:-85.1099},{name:516.6,value:-85.1361},{name:526.7,value:-85.1599},{name:536.8,value:-85.1814},{name:546.9,value:-85.2009},{name:557,value:-85.2186},{name:567.1,value:-85.2347},{name:577.2,value:-85.2493},{name:587.3,value:-85.2627},{name:597.4,value:-85.2748},{name:607.5,value:-85.286},{name:617.6,value:-85.2962},{name:627.7,value:-85.3055},{name:637.8,value:-85.314},{name:647.9,value:-85.3219},{name:658,value:-85.3291},{name:668.1,value:-85.3358},{name:678.2,value:-85.3419},{name:688.3,value:-85.3475},{name:698.4,value:-85.3527},{name:708.5,value:-85.3576},{name:718.6,value:-85.362},{name:728.7,value:-85.3662},{name:738.8,value:-85.37},{name:748.9,value:-85.3736},{name:759,value:-85.3769},{name:769.1,value:-85.38},{name:779.2,value:-85.3828},{name:789.3,value:-85.3855},{name:799.4,value:-85.3881},{name:809.5,value:-85.3904},{name:819.6,value:-85.3926},{name:829.7,value:-85.3947},{name:839.8,value:-85.3967},{name:849.9,value:-85.3985},{name:860,value:-85.4003},{name:870.1,value:-85.4019},{name:880.2,value:-85.4035},{name:890.3,value:-85.405},{name:900.4,value:-85.4064},{name:910.5,value:-85.4078},{name:920.6,value:-85.4091},{name:930.7,value:-85.4103},{name:940.8,value:-85.4115},{name:950.9,value:-85.4126},{name:961,value:-85.4137},{name:971.1,value:-85.4148},{name:981.2,value:-85.4158},{name:991.3,value:-85.4168}]},{name:'0.001',series:[{name:-5,value:-85.4171},{name:0,value:-85.4176},{name:0.1,value:-80.259},{name:0.2,value:-75.162},{name:0.3,value:-70.112},{name:0.4,value:-65.0771},{name:0.5,value:-59.9728},{name:0.6,value:-54.5089},{name:0.7,value:-47.6551},{name:0.8,value:-35.7452},{name:0.9,value:-7.28964},{name:1,value:23.4758},{name:1.1,value:33.4986},{name:1.2,value:36.6416},{name:1.6,value:35.898},{name:1.7,value:35.0889},{name:1.8,value:34.2327},{name:1.9,value:33.3557},{name:2,value:32.4768},{name:2.1,value:31.6103},{name:2.2,value:30.7672},{name:2.3,value:29.9556},{name:2.4,value:29.1817},{name:2.5,value:28.4499},{name:2.6,value:27.7628},{name:2.7,value:27.122},{name:2.8,value:26.528},{name:2.9,value:25.9802},{name:3.1,value:25.0163},{name:3.2,value:24.5961},{name:3.4,value:23.8693},{name:3.5,value:23.5579},{name:3.9,value:22.5906},{name:4,value:22.3994},{name:4.5,value:21.4163},{name:4.6,value:21.16},{name:4.9,value:20.3006},{name:5,value:20.0082},{name:5.3,value:19.1795},{name:5.4,value:18.9266},{name:5.8,value:18.0486},{name:5.9,value:17.8616},{name:6.6,value:16.863},{name:6.7,value:16.7582},{name:14.5,value:17.7524},{name:14.6,value:17.7954},{name:16.9,value:18.7763},{name:17,value:18.8182},{name:19.4,value:19.7979},{name:19.5,value:19.8375},{name:22.1,value:20.8356},{name:22.2,value:20.8728},{name:24.9,value:21.8556},{name:25,value:21.8913},{name:27.9,value:22.8694},{name:28,value:22.9},{name:31.9,value:23.8929},{name:32,value:23.9134},{name:39.8,value:24.9096},{name:39.9,value:24.9162},{name:50,value:25.1503},{name:60.1,value:24.948},{name:70.2,value:24.5833},{name:80.3,value:24.1175},{name:90.4,value:23.5593},{name:100.5,value:22.9091},{name:110.6,value:22.1675},{name:120.7,value:21.3347},{name:130.7,value:20.4192},{name:140.6,value:19.4199},{name:140.7,value:19.4093},{name:149.7,value:18.4133},{name:149.8,value:18.4017},{name:158,value:17.4139},{name:158.1,value:17.4013},{name:165.7,value:16.4088},{name:165.8,value:16.3952},{name:172.8,value:15.4065},{name:172.9,value:15.3918},{name:179.4,value:14.4008},{name:179.5,value:14.385},{name:185.5,value:13.3989},{name:185.6,value:13.3819},{name:191.2,value:12.3911},{name:191.3,value:12.3728},{name:196.5,value:11.3834},{name:196.6,value:11.3637},{name:201.4,value:10.3832},{name:201.5,value:10.3621},{name:206,value:9.37666},{name:206.1,value:9.354},{name:210.3,value:8.36934},{name:210.4,value:8.34509},{name:214.3,value:7.36808},{name:214.4,value:7.3422},{name:218.1,value:6.35342},{name:218.2,value:6.32582},{name:221.7,value:5.32947},{name:221.8,value:5.3001},{name:225.1,value:4.30132},{name:225.2,value:4.27014},{name:228.3,value:3.27504},{name:228.4,value:3.24201},{name:231.3,value:2.25751},{name:231.4,value:2.22262},{name:234.1,value:1.25621},{name:234.2,value:1.21949},{name:236.8,value:0.240447},{name:236.9,value:0.201838},{name:239.4,value:-0.787427},{name:239.5,value:-0.827983},{name:241.9,value:-1.82526},{name:242,value:-1.86784},{name:244.2,value:-2.82662},{name:244.3,value:-2.87124},{name:246.4,value:-3.8303},{name:246.5,value:-3.87707},{name:248.5,value:-4.83475},{name:248.6,value:-4.8838},{name:250.5,value:-5.83848},{name:250.6,value:-5.88997},{name:252.4,value:-6.83984},{name:252.5,value:-6.89395},{name:254.3,value:-7.89372},{name:254.4,value:-7.95077},{name:256.1,value:-8.94672},{name:256.2,value:-9.00691},{name:257.8,value:-9.996},{name:257.9,value:-10.0595},{name:259.4,value:-11.0378},{name:259.5,value:-11.1047},{name:260.9,value:-12.0671},{name:261,value:-12.1377},{name:262.3,value:-13.0783},{name:262.4,value:-13.1525},{name:263.7,value:-14.1421},{name:263.8,value:-14.2202},{name:265,value:-15.1807},{name:265.1,value:-15.2627},{name:266.2,value:-16.1854},{name:266.3,value:-16.2712},{name:267.4,value:-17.2367},{name:267.5,value:-17.3264},{name:268.5,value:-18.2431},{name:268.6,value:-18.3366},{name:269.6,value:-19.2918},{name:269.7,value:-19.3892},{name:270.7,value:-20.384},{name:270.8,value:-20.4855},{name:271.7,value:-21.4155},{name:271.8,value:-21.5207},{name:272.7,value:-22.4843},{name:272.8,value:-22.5933},{name:273.7,value:-23.5909},{name:273.8,value:-23.7037},{name:274.6,value:-24.6194},{name:274.7,value:-24.7355},{name:275.5,value:-25.6787},{name:275.6,value:-25.7984},{name:276.4,value:-26.7692},{name:276.5,value:-26.8923},{name:277.3,value:-27.8909},{name:277.4,value:-28.0175},{name:278.1,value:-28.9143},{name:278.2,value:-29.044},{name:278.9,value:-29.9627},{name:279,value:-30.0956},{name:279.7,value:-31.0365},{name:279.8,value:-31.1726},{name:280.5,value:-32.1361},{name:280.6,value:-32.2754},{name:281.3,value:-33.2621},{name:281.4,value:-33.4048},{name:282,value:-34.2697},{name:282.1,value:-34.4154},{name:282.7,value:-35.2988},{name:282.8,value:-35.4476},{name:283.4,value:-36.3503},{name:283.5,value:-36.5024},{name:284.1,value:-37.4253},{name:284.2,value:-37.5808},{name:284.8,value:-38.5249},{name:284.9,value:-38.6841},{name:285.5,value:-39.6506},{name:285.6,value:-39.8136},{name:286.2,value:-40.8039},{name:286.3,value:-40.9711},{name:286.8,value:-41.8159},{name:286.9,value:-41.9868},{name:287.4,value:-42.8508},{name:287.5,value:-43.0256},{name:288,value:-43.9099},{name:288.1,value:-44.0889},{name:288.6,value:-44.9946},{name:288.7,value:-45.178},{name:289.2,value:-46.1065},{name:289.3,value:-46.2945},{name:289.8,value:-47.2468},{name:289.9,value:-47.4397},{name:290.4,value:-48.417},{name:290.5,value:-48.615},{name:290.9,value:-49.4159},{name:291,value:-49.6183},{name:291.4,value:-50.4369},{name:291.5,value:-50.6438},{name:291.9,value:-51.4804},{name:292,value:-51.6918},{name:292.4,value:-52.5466},{name:292.5,value:-52.7625},{name:292.9,value:-53.6352},{name:293,value:-53.8556},{name:293.4,value:-54.7456},{name:293.5,value:-54.9702},{name:293.9,value:-55.8767},{name:294,value:-56.1053},{name:294.4,value:-57.0267},{name:294.5,value:-57.2588},{name:294.9,value:-58.1932},{name:295,value:-58.4282},{name:295.4,value:-59.373},{name:295.5,value:-59.6102},{name:295.9,value:-60.562},{name:296,value:-60.8005},{name:296.4,value:-61.7555},{name:296.5,value:-61.9943},{name:296.9,value:-62.9481},{name:297,value:-63.1859},{name:297.4,value:-64.1335},{name:297.5,value:-64.3692},{name:297.9,value:-65.3054},{name:298,value:-65.5375},{name:298.4,value:-66.4571},{name:298.5,value:-66.6844},{name:298.9,value:-67.5821},{name:299,value:-67.8033},{name:299.4,value:-68.6741},{name:299.5,value:-68.8881},{name:299.9,value:-69.7278},{name:300,value:-69.9334},{name:300.4,value:-70.7381},{name:300.5,value:-70.9347},{name:301,value:-71.8882},{name:301.1,value:-72.0729},{name:301.6,value:-72.9656},{name:301.7,value:-73.138},{name:302.3,value:-74.1275},{name:302.4,value:-74.285},{name:303,value:-75.1859},{name:303.1,value:-75.3288},{name:303.8,value:-76.2715},{name:303.9,value:-76.3982},{name:304.7,value:-77.3428},{name:304.8,value:-77.4525},{name:305.7,value:-78.3623},{name:305.8,value:-78.4552},{name:307,value:-79.4528},{name:307.1,value:-79.5269},{name:308.6,value:-80.4941},{name:308.7,value:-80.5498},{name:310.8,value:-81.5161},{name:310.9,value:-81.5536},{name:314.5,value:-82.5404},{name:314.6,value:-82.5598},{name:324.7,value:-83.505},{name:334.8,value:-83.7749},{name:344.9,value:-83.9414},{name:355,value:-84.0833},{name:365.1,value:-84.2116},{name:375.2,value:-84.3283},{name:385.3,value:-84.4341},{name:395.4,value:-84.5295},{name:405.5,value:-84.6154},{name:415.6,value:-84.6924},{name:425.7,value:-84.7614},{name:435.8,value:-84.8232},{name:445.9,value:-84.8786},{name:456,value:-84.9282},{name:466.1,value:-84.9727},{name:476.2,value:-85.0126},{name:486.3,value:-85.0485},{name:496.4,value:-85.0808},{name:506.5,value:-85.1099},{name:516.6,value:-85.1361},{name:526.7,value:-85.1599},{name:536.8,value:-85.1814},{name:546.9,value:-85.2009},{name:557,value:-85.2186},{name:567.1,value:-85.2347},{name:577.2,value:-85.2493},{name:587.3,value:-85.2627},{name:597.4,value:-85.2748},{name:607.5,value:-85.286},{name:617.6,value:-85.2962},{name:627.7,value:-85.3055},{name:637.8,value:-85.314},{name:647.9,value:-85.3219},{name:658,value:-85.3291},{name:668.1,value:-85.3358},{name:678.2,value:-85.3419},{name:688.3,value:-85.3475},{name:698.4,value:-85.3527},{name:708.5,value:-85.3576},{name:718.6,value:-85.362},{name:728.7,value:-85.3662},{name:738.8,value:-85.37},{name:748.9,value:-85.3736},{name:759,value:-85.3769},{name:769.1,value:-85.38},{name:779.2,value:-85.3828},{name:789.3,value:-85.3855},{name:799.4,value:-85.3881},{name:809.5,value:-85.3904},{name:819.6,value:-85.3926},{name:829.7,value:-85.3947},{name:839.8,value:-85.3967},{name:849.9,value:-85.3985},{name:860,value:-85.4003},{name:870.1,value:-85.4019},{name:880.2,value:-85.4035},{name:890.3,value:-85.405},{name:900.4,value:-85.4064},{name:910.5,value:-85.4078},{name:920.6,value:-85.409},{name:930.7,value:-85.4103},{name:940.8,value:-85.4115},{name:950.9,value:-85.4126},{name:961,value:-85.4137},{name:971.1,value:-85.4148},{name:981.2,value:-85.4158},{name:991.3,value:-85.4168}]},{name:'1',series:[{name:-5,value:-85.4171},{name:0,value:-85.4176},{name:0.1,value:-80.259},{name:0.2,value:-75.162},{name:0.3,value:-70.112},{name:0.4,value:-65.0771},{name:0.5,value:-59.9728},{name:0.6,value:-54.5088},{name:0.7,value:-47.6553},{name:0.8,value:-35.7456},{name:0.9,value:-7.29072},{name:1,value:23.4749},{name:1.1,value:33.4979},{name:1.2,value:36.6414},{name:1.6,value:35.898},{name:1.7,value:35.0889},{name:1.8,value:34.2327},{name:1.9,value:33.3557},{name:2,value:32.4769},{name:2.1,value:31.6104},{name:2.2,value:30.7672},{name:2.3,value:29.9557},{name:2.4,value:29.1818},{name:2.5,value:28.4499},{name:2.6,value:27.7628},{name:2.7,value:27.1221},{name:2.8,value:26.528},{name:2.9,value:25.9803},{name:3.1,value:25.0163},{name:3.2,value:24.5962},{name:3.4,value:23.8693},{name:3.5,value:23.5579},{name:3.9,value:22.5907},{name:4,value:22.3995},{name:4.5,value:21.4164},{name:4.6,value:21.1601},{name:4.9,value:20.3007},{name:5,value:20.0083},{name:5.3,value:19.1796},{name:5.4,value:18.9267},{name:5.8,value:18.0486},{name:5.9,value:17.8617},{name:6.6,value:16.863},{name:6.7,value:16.7582},{name:14.5,value:17.7524},{name:14.6,value:17.7954},{name:16.9,value:18.7763},{name:17,value:18.8182},{name:19.4,value:19.7978},{name:19.5,value:19.8375},{name:22.1,value:20.8356},{name:22.2,value:20.8728},{name:24.9,value:21.8556},{name:25,value:21.8913},{name:27.9,value:22.8694},{name:28,value:22.9},{name:31.9,value:23.8929},{name:32,value:23.9134},{name:39.8,value:24.9095},{name:39.9,value:24.9162},{name:50,value:25.1503},{name:60.1,value:24.948},{name:70.2,value:24.5833},{name:80.3,value:24.1175},{name:90.4,value:23.5593},{name:100.5,value:22.9091},{name:110.6,value:22.1675},{name:120.7,value:21.3347},{name:130.7,value:20.4192},{name:140.6,value:19.4199},{name:140.7,value:19.4093},{name:149.7,value:18.4133},{name:149.8,value:18.4017},{name:158,value:17.4139},{name:158.1,value:17.4013},{name:165.7,value:16.4088},{name:165.8,value:16.3952},{name:172.8,value:15.4065},{name:172.9,value:15.3918},{name:179.4,value:14.4008},{name:179.5,value:14.385},{name:185.5,value:13.3989},{name:185.6,value:13.3819},{name:191.2,value:12.3911},{name:191.3,value:12.3728},{name:196.5,value:11.3834},{name:196.6,value:11.3637},{name:201.4,value:10.3832},{name:201.5,value:10.3621},{name:206,value:9.37666},{name:206.1,value:9.35399},{name:210.3,value:8.36933},{name:210.4,value:8.34508},{name:214.3,value:7.36807},{name:214.4,value:7.34219},{name:218.1,value:6.35341},{name:218.2,value:6.32581},{name:221.7,value:5.32946},{name:221.8,value:5.30009},{name:225.1,value:4.30131},{name:225.2,value:4.27013},{name:228.3,value:3.27503},{name:228.4,value:3.242},{name:231.3,value:2.2575},{name:231.4,value:2.22261},{name:234.1,value:1.2562},{name:234.2,value:1.21947},{name:236.8,value:0.240434},{name:236.9,value:0.201825},{name:239.4,value:-0.787441},{name:239.5,value:-0.827997},{name:241.9,value:-1.82528},{name:242,value:-1.86786},{name:244.2,value:-2.82664},{name:244.3,value:-2.87125},{name:246.4,value:-3.83032},{name:246.5,value:-3.87708},{name:248.5,value:-4.83477},{name:248.6,value:-4.88382},{name:250.5,value:-5.8385},{name:250.6,value:-5.88999},{name:252.4,value:-6.83986},{name:252.5,value:-6.89396},{name:254.3,value:-7.89374},{name:254.4,value:-7.95079},{name:256.1,value:-8.94674},{name:256.2,value:-9.00693},{name:257.8,value:-9.99602},{name:257.9,value:-10.0595},{name:259.4,value:-11.0378},{name:259.5,value:-11.1048},{name:260.9,value:-12.0672},{name:261,value:-12.1377},{name:262.3,value:-13.0783},{name:262.4,value:-13.1525},{name:263.7,value:-14.1422},{name:263.8,value:-14.2203},{name:265,value:-15.1807},{name:265.1,value:-15.2627},{name:266.2,value:-16.1854},{name:266.3,value:-16.2712},{name:267.4,value:-17.2367},{name:267.5,value:-17.3265},{name:268.5,value:-18.2431},{name:268.6,value:-18.3367},{name:269.6,value:-19.2918},{name:269.7,value:-19.3893},{name:270.7,value:-20.384},{name:270.8,value:-20.4855},{name:271.7,value:-21.4155},{name:271.8,value:-21.5207},{name:272.7,value:-22.4844},{name:272.8,value:-22.5933},{name:273.7,value:-23.591},{name:273.8,value:-23.7037},{name:274.6,value:-24.6194},{name:274.7,value:-24.7356},{name:275.5,value:-25.6788},{name:275.6,value:-25.7984},{name:276.4,value:-26.7693},{name:276.5,value:-26.8923},{name:277.3,value:-27.8909},{name:277.4,value:-28.0175},{name:278.1,value:-28.9143},{name:278.2,value:-29.044},{name:278.9,value:-29.9628},{name:279,value:-30.0956},{name:279.7,value:-31.0366},{name:279.8,value:-31.1726},{name:280.5,value:-32.1362},{name:280.6,value:-32.2755},{name:281.3,value:-33.2622},{name:281.4,value:-33.4048},{name:282,value:-34.2697},{name:282.1,value:-34.4154},{name:282.7,value:-35.2989},{name:282.8,value:-35.4477},{name:283.4,value:-36.3504},{name:283.5,value:-36.5025},{name:284.1,value:-37.4253},{name:284.2,value:-37.5809},{name:284.8,value:-38.525},{name:284.9,value:-38.6841},{name:285.5,value:-39.6506},{name:285.6,value:-39.8137},{name:286.2,value:-40.804},{name:286.3,value:-40.9711},{name:286.8,value:-41.816},{name:286.9,value:-41.9868},{name:287.4,value:-42.8508},{name:287.5,value:-43.0256},{name:288,value:-43.91},{name:288.1,value:-44.0889},{name:288.6,value:-44.9947},{name:288.7,value:-45.1781},{name:289.2,value:-46.1065},{name:289.3,value:-46.2946},{name:289.8,value:-47.2469},{name:289.9,value:-47.4398},{name:290.4,value:-48.4171},{name:290.5,value:-48.6151},{name:290.9,value:-49.4159},{name:291,value:-49.6183},{name:291.4,value:-50.4369},{name:291.5,value:-50.6438},{name:291.9,value:-51.4805},{name:292,value:-51.6919},{name:292.4,value:-52.5466},{name:292.5,value:-52.7626},{name:292.9,value:-53.6353},{name:293,value:-53.8556},{name:293.4,value:-54.7457},{name:293.5,value:-54.9703},{name:293.9,value:-55.8768},{name:294,value:-56.1053},{name:294.4,value:-57.0268},{name:294.5,value:-57.2589},{name:294.9,value:-58.1933},{name:295,value:-58.4283},{name:295.4,value:-59.373},{name:295.5,value:-59.6103},{name:295.9,value:-60.5621},{name:296,value:-60.8006},{name:296.4,value:-61.7556},{name:296.5,value:-61.9944},{name:296.9,value:-62.9481},{name:297,value:-63.186},{name:297.4,value:-64.1336},{name:297.5,value:-64.3692},{name:297.9,value:-65.3055},{name:298,value:-65.5376},{name:298.4,value:-66.4572},{name:298.5,value:-66.6845},{name:298.9,value:-67.5821},{name:299,value:-67.8034},{name:299.4,value:-68.6742},{name:299.5,value:-68.8882},{name:299.9,value:-69.7278},{name:300,value:-69.9335},{name:300.4,value:-70.7382},{name:300.5,value:-70.9347},{name:301,value:-71.8882},{name:301.1,value:-72.0729},{name:301.6,value:-72.9657},{name:301.7,value:-73.138},{name:302.3,value:-74.1275},{name:302.4,value:-74.2851},{name:303,value:-75.186},{name:303.1,value:-75.3288},{name:303.8,value:-76.2716},{name:303.9,value:-76.3982},{name:304.7,value:-77.3428},{name:304.8,value:-77.4525},{name:305.7,value:-78.3624},{name:305.8,value:-78.4552},{name:307,value:-79.4528},{name:307.1,value:-79.5269},{name:308.6,value:-80.4941},{name:308.7,value:-80.5498},{name:310.8,value:-81.5161},{name:310.9,value:-81.5536},{name:314.5,value:-82.5403},{name:314.6,value:-82.5597},{name:324.7,value:-83.505},{name:334.8,value:-83.7749},{name:344.9,value:-83.9414},{name:355,value:-84.0833},{name:365.1,value:-84.2116},{name:375.2,value:-84.3283},{name:385.3,value:-84.4341},{name:395.4,value:-84.5295},{name:405.5,value:-84.6154},{name:415.6,value:-84.6924},{name:425.7,value:-84.7614},{name:435.8,value:-84.8232},{name:445.9,value:-84.8786},{name:456,value:-84.9282},{name:466.1,value:-84.9727},{name:476.2,value:-85.0126},{name:486.3,value:-85.0485},{name:496.4,value:-85.0808},{name:506.5,value:-85.1099},{name:516.6,value:-85.1361},{name:526.7,value:-85.1599},{name:536.8,value:-85.1814},{name:546.9,value:-85.2009},{name:557,value:-85.2186},{name:567.1,value:-85.2347},{name:577.2,value:-85.2493},{name:587.3,value:-85.2627},{name:597.4,value:-85.2748},{name:607.5,value:-85.286},{name:617.6,value:-85.2962},{name:627.7,value:-85.3055},{name:637.8,value:-85.314},{name:647.9,value:-85.3219},{name:658,value:-85.3291},{name:668.1,value:-85.3358},{name:678.2,value:-85.3419},{name:688.3,value:-85.3475},{name:698.4,value:-85.3527},{name:708.5,value:-85.3576},{name:718.6,value:-85.362},{name:728.7,value:-85.3662},{name:738.8,value:-85.37},{name:748.9,value:-85.3736},{name:759,value:-85.3769},{name:769.1,value:-85.38},{name:779.2,value:-85.3828},{name:789.3,value:-85.3855},{name:799.4,value:-85.3881},{name:809.5,value:-85.3904},{name:819.6,value:-85.3926},{name:829.7,value:-85.3947},{name:839.8,value:-85.3967},{name:849.9,value:-85.3985},{name:860,value:-85.4003},{name:870.1,value:-85.4019},{name:880.2,value:-85.4035},{name:890.3,value:-85.405},{name:900.4,value:-85.4064},{name:910.5,value:-85.4078},{name:920.6,value:-85.409},{name:930.7,value:-85.4103},{name:940.8,value:-85.4115},{name:950.9,value:-85.4126},{name:961,value:-85.4137},{name:971.1,value:-85.4148},{name:981.2,value:-85.4158},{name:991.3,value:-85.4168}]},{name:'10',series:[{name:-5,value:-85.4171},{name:0,value:-85.4176},{name:0.1,value:-80.259},{name:0.2,value:-75.162},{name:0.3,value:-70.112},{name:0.4,value:-65.0771},{name:0.5,value:-59.9729},{name:0.6,value:-54.5091},{name:0.7,value:-47.6559},{name:0.8,value:-35.747},{name:0.9,value:-7.29354},{name:1,value:23.4738},{name:1.1,value:33.4979},{name:1.2,value:36.6413},{name:1.6,value:35.898},{name:1.7,value:35.0889},{name:1.8,value:34.2327},{name:1.9,value:33.3557},{name:2,value:32.4769},{name:2.1,value:31.6104},{name:2.2,value:30.7672},{name:2.3,value:29.9556},{name:2.4,value:29.1818},{name:2.5,value:28.4499},{name:2.6,value:27.7628},{name:2.7,value:27.122},{name:2.8,value:26.528},{name:2.9,value:25.9803},{name:3.1,value:25.0163},{name:3.2,value:24.5961},{name:3.4,value:23.8693},{name:3.5,value:23.5579},{name:3.9,value:22.5907},{name:4,value:22.3995},{name:4.5,value:21.4164},{name:4.6,value:21.1601},{name:4.9,value:20.3007},{name:5,value:20.0083},{name:5.3,value:19.1796},{name:5.4,value:18.9267},{name:5.8,value:18.0486},{name:5.9,value:17.8617},{name:6.6,value:16.863},{name:6.7,value:16.7582},{name:14.5,value:17.7524},{name:14.6,value:17.7954},{name:16.9,value:18.7763},{name:17,value:18.8182},{name:19.4,value:19.7979},{name:19.5,value:19.8375},{name:22.1,value:20.8356},{name:22.2,value:20.8728},{name:24.9,value:21.8556},{name:25,value:21.8913},{name:27.9,value:22.8694},{name:28,value:22.9},{name:31.9,value:23.8929},{name:32,value:23.9134},{name:39.8,value:24.9095},{name:39.9,value:24.9162},{name:50,value:25.1503},{name:60.1,value:24.948},{name:70.2,value:24.5833},{name:80.3,value:24.1175},{name:90.4,value:23.5593},{name:100.5,value:22.9091},{name:110.6,value:22.1675},{name:120.7,value:21.3347},{name:130.7,value:20.4192},{name:140.6,value:19.4199},{name:140.7,value:19.4093},{name:149.7,value:18.4133},{name:149.8,value:18.4017},{name:158,value:17.4139},{name:158.1,value:17.4013},{name:165.7,value:16.4088},{name:165.8,value:16.3952},{name:172.8,value:15.4065},{name:172.9,value:15.3918},{name:179.4,value:14.4008},{name:179.5,value:14.385},{name:185.5,value:13.3989},{name:185.6,value:13.3819},{name:191.2,value:12.3911},{name:191.3,value:12.3728},{name:196.5,value:11.3834},{name:196.6,value:11.3637},{name:201.4,value:10.3832},{name:201.5,value:10.3621},{name:206,value:9.37665},{name:206.1,value:9.35398},{name:210.3,value:8.36932},{name:210.4,value:8.34507},{name:214.3,value:7.36806},{name:214.4,value:7.34218},{name:218.1,value:6.3534},{name:218.2,value:6.3258},{name:221.7,value:5.32945},{name:221.8,value:5.30008},{name:225.1,value:4.3013},{name:225.2,value:4.27012},{name:228.3,value:3.27502},{name:228.4,value:3.24199},{name:231.3,value:2.25749},{name:231.4,value:2.2226},{name:234.1,value:1.25619},{name:234.2,value:1.21946},{name:236.8,value:0.240426},{name:236.9,value:0.201816},{name:239.4,value:-0.78745},{name:239.5,value:-0.828006},{name:241.9,value:-1.82528},{name:242,value:-1.86786},{name:244.2,value:-2.82665},{name:244.3,value:-2.87126},{name:246.4,value:-3.83033},{name:246.5,value:-3.8771},{name:248.5,value:-4.83479},{name:248.6,value:-4.88384},{name:250.5,value:-5.83852},{name:250.6,value:-5.89001},{name:252.4,value:-6.83989},{name:252.5,value:-6.89399},{name:254.3,value:-7.89377},{name:254.4,value:-7.95082},{name:256.1,value:-8.94678},{name:256.2,value:-9.00697},{name:257.8,value:-9.99606},{name:257.9,value:-10.0596},{name:259.4,value:-11.0378},{name:259.5,value:-11.1048},{name:260.9,value:-12.0672},{name:261,value:-12.1378},{name:262.3,value:-13.0784},{name:262.4,value:-13.1526},{name:263.7,value:-14.1422},{name:263.8,value:-14.2203},{name:265,value:-15.1808},{name:265.1,value:-15.2628},{name:266.2,value:-16.1855},{name:266.3,value:-16.2713},{name:267.4,value:-17.2368},{name:267.5,value:-17.3266},{name:268.5,value:-18.2432},{name:268.6,value:-18.3368},{name:269.6,value:-19.2919},{name:269.7,value:-19.3894},{name:270.7,value:-20.3841},{name:270.8,value:-20.4856},{name:271.7,value:-21.4157},{name:271.8,value:-21.5209},{name:272.7,value:-22.4845},{name:272.8,value:-22.5935},{name:273.7,value:-23.5911},{name:273.8,value:-23.7038},{name:274.6,value:-24.6195},{name:274.7,value:-24.7357},{name:275.5,value:-25.6789},{name:275.6,value:-25.7985},{name:276.4,value:-26.7694},{name:276.5,value:-26.8925},{name:277.3,value:-27.8911},{name:277.4,value:-28.0176},{name:278.1,value:-28.9145},{name:278.2,value:-29.0442},{name:278.9,value:-29.9629},{name:279,value:-30.0958},{name:279.7,value:-31.0367},{name:279.8,value:-31.1727},{name:280.5,value:-32.1363},{name:280.6,value:-32.2756},{name:281.3,value:-33.2623},{name:281.4,value:-33.405},{name:282,value:-34.2699},{name:282.1,value:-34.4156},{name:282.7,value:-35.299},{name:282.8,value:-35.4478},{name:283.4,value:-36.3505},{name:283.5,value:-36.5026},{name:284.1,value:-37.4255},{name:284.2,value:-37.5811},{name:284.8,value:-38.5251},{name:284.9,value:-38.6843},{name:285.5,value:-39.6508},{name:285.6,value:-39.8138},{name:286.2,value:-40.8042},{name:286.3,value:-40.9713},{name:286.8,value:-41.8161},{name:286.9,value:-41.987},{name:287.4,value:-42.851},{name:287.5,value:-43.0258},{name:288,value:-43.9101},{name:288.1,value:-44.0891},{name:288.6,value:-44.9949},{name:288.7,value:-45.1783},{name:289.2,value:-46.1067},{name:289.3,value:-46.2948},{name:289.8,value:-47.247},{name:289.9,value:-47.44},{name:290.4,value:-48.4173},{name:290.5,value:-48.6153},{name:290.9,value:-49.4161},{name:291,value:-49.6185},{name:291.4,value:-50.4371},{name:291.5,value:-50.644},{name:291.9,value:-51.4807},{name:292,value:-51.6921},{name:292.4,value:-52.5468},{name:292.5,value:-52.7628},{name:292.9,value:-53.6355},{name:293,value:-53.8558},{name:293.4,value:-54.7459},{name:293.5,value:-54.9705},{name:293.9,value:-55.877},{name:294,value:-56.1056},{name:294.4,value:-57.027},{name:294.5,value:-57.2591},{name:294.9,value:-58.1935},{name:295,value:-58.4285},{name:295.4,value:-59.3733},{name:295.5,value:-59.6105},{name:295.9,value:-60.5623},{name:296,value:-60.8008},{name:296.4,value:-61.7558},{name:296.5,value:-61.9946},{name:296.9,value:-62.9484},{name:297,value:-63.1862},{name:297.4,value:-64.1338},{name:297.5,value:-64.3695},{name:297.9,value:-65.3057},{name:298,value:-65.5378},{name:298.4,value:-66.4574},{name:298.5,value:-66.6847},{name:298.9,value:-67.5823},{name:299,value:-67.8036},{name:299.4,value:-68.6744},{name:299.5,value:-68.8884},{name:299.9,value:-69.728},{name:300,value:-69.9337},{name:300.4,value:-70.7384},{name:300.5,value:-70.9349},{name:301,value:-71.8884},{name:301.1,value:-72.0731},{name:301.6,value:-72.9659},{name:301.7,value:-73.1382},{name:302.3,value:-74.1277},{name:302.4,value:-74.2852},{name:303,value:-75.1861},{name:303.1,value:-75.3289},{name:303.8,value:-76.2717},{name:303.9,value:-76.3984},{name:304.7,value:-77.3429},{name:304.8,value:-77.4526},{name:305.7,value:-78.3625},{name:305.8,value:-78.4553},{name:307,value:-79.4529},{name:307.1,value:-79.527},{name:308.6,value:-80.4941},{name:308.7,value:-80.5499},{name:310.8,value:-81.5162},{name:310.9,value:-81.5537},{name:314.5,value:-82.5404},{name:314.6,value:-82.5598},{name:324.7,value:-83.5051},{name:334.8,value:-83.7749},{name:344.9,value:-83.9414},{name:355,value:-84.0833},{name:365.1,value:-84.2116},{name:375.2,value:-84.3283},{name:385.3,value:-84.4341},{name:395.4,value:-84.5295},{name:405.5,value:-84.6154},{name:415.6,value:-84.6924},{name:425.7,value:-84.7614},{name:435.8,value:-84.8232},{name:445.9,value:-84.8786},{name:456,value:-84.9282},{name:466.1,value:-84.9727},{name:476.2,value:-85.0126},{name:486.3,value:-85.0485},{name:496.4,value:-85.0808},{name:506.5,value:-85.1099},{name:516.6,value:-85.1361},{name:526.7,value:-85.1599},{name:536.8,value:-85.1814},{name:546.9,value:-85.2009},{name:557,value:-85.2186},{name:567.1,value:-85.2347},{name:577.2,value:-85.2493},{name:587.3,value:-85.2627},{name:597.4,value:-85.2748},{name:607.5,value:-85.286},{name:617.6,value:-85.2962},{name:627.7,value:-85.3055},{name:637.8,value:-85.314},{name:647.9,value:-85.3219},{name:658,value:-85.3291},{name:668.1,value:-85.3358},{name:678.2,value:-85.3419},{name:688.3,value:-85.3475},{name:698.4,value:-85.3527},{name:708.5,value:-85.3576},{name:718.6,value:-85.362},{name:728.7,value:-85.3662},{name:738.8,value:-85.37},{name:748.9,value:-85.3736},{name:759,value:-85.3769},{name:769.1,value:-85.38},{name:779.2,value:-85.3828},{name:789.3,value:-85.3855},{name:799.4,value:-85.3881},{name:809.5,value:-85.3904},{name:819.6,value:-85.3926},{name:829.7,value:-85.3947},{name:839.8,value:-85.3967},{name:849.9,value:-85.3985},{name:860,value:-85.4003},{name:870.1,value:-85.4019},{name:880.2,value:-85.4035},{name:890.3,value:-85.405},{name:900.4,value:-85.4064},{name:910.5,value:-85.4078},{name:920.6,value:-85.409},{name:930.7,value:-85.4103},{name:940.8,value:-85.4115},{name:950.9,value:-85.4126},{name:961,value:-85.4137},{name:971.1,value:-85.4148},{name:981.2,value:-85.4158},{name:991.3,value:-85.4168}]},{name:'100',series:[{name:-5,value:-85.4171},{name:0,value:-85.4176},{name:0.1,value:-80.259},{name:0.2,value:-75.162},{name:0.3,value:-70.112},{name:0.4,value:-65.0771},{name:0.5,value:-59.9727},{name:0.6,value:-54.5087},{name:0.7,value:-47.6555},{name:0.8,value:-35.7459},{name:0.9,value:-7.29084},{name:1,value:23.475},{name:1.1,value:33.4981},{name:1.2,value:36.6412},{name:1.6,value:35.898},{name:1.7,value:35.0889},{name:1.8,value:34.2326},{name:1.9,value:33.3556},{name:2,value:32.4768},{name:2.1,value:31.6103},{name:2.2,value:30.7672},{name:2.3,value:29.9556},{name:2.4,value:29.1817},{name:2.5,value:28.4499},{name:2.6,value:27.7628},{name:2.7,value:27.122},{name:2.8,value:26.528},{name:2.9,value:25.9802},{name:3.1,value:25.0163},{name:3.2,value:24.5961},{name:3.4,value:23.8693},{name:3.5,value:23.5579},{name:3.9,value:22.5906},{name:4,value:22.3994},{name:4.5,value:21.4164},{name:4.6,value:21.1601},{name:4.9,value:20.3007},{name:5,value:20.0083},{name:5.3,value:19.1796},{name:5.4,value:18.9267},{name:5.8,value:18.0486},{name:5.9,value:17.8617},{name:6.6,value:16.863},{name:6.7,value:16.7582},{name:14.5,value:17.7524},{name:14.6,value:17.7954},{name:16.9,value:18.7763},{name:17,value:18.8182},{name:19.4,value:19.7978},{name:19.5,value:19.8375},{name:22.1,value:20.8356},{name:22.2,value:20.8728},{name:24.9,value:21.8556},{name:25,value:21.8913},{name:27.9,value:22.8694},{name:28,value:22.9},{name:31.9,value:23.8929},{name:32,value:23.9134},{name:39.8,value:24.9095},{name:39.9,value:24.9162},{name:50,value:25.1503},{name:60.1,value:24.948},{name:70.2,value:24.5833},{name:80.3,value:24.1175},{name:90.4,value:23.5593},{name:100.5,value:22.9091},{name:110.6,value:22.1675},{name:120.7,value:21.3347},{name:130.7,value:20.4192},{name:140.6,value:19.4199},{name:140.7,value:19.4093},{name:149.7,value:18.4133},{name:149.8,value:18.4017},{name:158,value:17.4139},{name:158.1,value:17.4013},{name:165.7,value:16.4088},{name:165.8,value:16.3952},{name:172.8,value:15.4065},{name:172.9,value:15.3918},{name:179.4,value:14.4008},{name:179.5,value:14.385},{name:185.5,value:13.3989},{name:185.6,value:13.3819},{name:191.2,value:12.3911},{name:191.3,value:12.3728},{name:196.5,value:11.3834},{name:196.6,value:11.3637},{name:201.4,value:10.3832},{name:201.5,value:10.3621},{name:206,value:9.37665},{name:206.1,value:9.35398},{name:210.3,value:8.36932},{name:210.4,value:8.34507},{name:214.3,value:7.36806},{name:214.4,value:7.34217},{name:218.1,value:6.35339},{name:218.2,value:6.3258},{name:221.7,value:5.32944},{name:221.8,value:5.30007},{name:225.1,value:4.3013},{name:225.2,value:4.27011},{name:228.3,value:3.27502},{name:228.4,value:3.24198},{name:231.3,value:2.25748},{name:231.4,value:2.22259},{name:234.1,value:1.25618},{name:234.2,value:1.21946},{name:236.8,value:0.240416},{name:236.9,value:0.201806},{name:239.4,value:-0.787461},{name:239.5,value:-0.828017},{name:241.9,value:-1.8253},{name:242,value:-1.86788},{name:244.2,value:-2.82666},{name:244.3,value:-2.87127},{name:246.4,value:-3.83034},{name:246.5,value:-3.87711},{name:248.5,value:-4.83479},{name:248.6,value:-4.88384},{name:250.5,value:-5.83852},{name:250.6,value:-5.89001},{name:252.4,value:-6.83989},{name:252.5,value:-6.89399},{name:254.3,value:-7.89377},{name:254.4,value:-7.95082},{name:256.1,value:-8.94677},{name:256.2,value:-9.00696},{name:257.8,value:-9.99605},{name:257.9,value:-10.0596},{name:259.4,value:-11.0378},{name:259.5,value:-11.1048},{name:260.9,value:-12.0672},{name:261,value:-12.1378},{name:262.3,value:-13.0783},{name:262.4,value:-13.1525},{name:263.7,value:-14.1422},{name:263.8,value:-14.2203},{name:265,value:-15.1807},{name:265.1,value:-15.2627},{name:266.2,value:-16.1854},{name:266.3,value:-16.2712},{name:267.4,value:-17.2367},{name:267.5,value:-17.3265},{name:268.5,value:-18.2431},{name:268.6,value:-18.3367},{name:269.6,value:-19.2918},{name:269.7,value:-19.3893},{name:270.7,value:-20.3841},{name:270.8,value:-20.4856},{name:271.7,value:-21.4156},{name:271.8,value:-21.5208},{name:272.7,value:-22.4844},{name:272.8,value:-22.5934},{name:273.7,value:-23.591},{name:273.8,value:-23.7038},{name:274.6,value:-24.6195},{name:274.7,value:-24.7356},{name:275.5,value:-25.6788},{name:275.6,value:-25.7985},{name:276.4,value:-26.7693},{name:276.5,value:-26.8924},{name:277.3,value:-27.891},{name:277.4,value:-28.0176},{name:278.1,value:-28.9144},{name:278.2,value:-29.0441},{name:278.9,value:-29.9628},{name:279,value:-30.0957},{name:279.7,value:-31.0366},{name:279.8,value:-31.1727},{name:280.5,value:-32.1362},{name:280.6,value:-32.2755},{name:281.3,value:-33.2622},{name:281.4,value:-33.4049},{name:282,value:-34.2698},{name:282.1,value:-34.4155},{name:282.7,value:-35.2989},{name:282.8,value:-35.4477},{name:283.4,value:-36.3505},{name:283.5,value:-36.5026},{name:284.1,value:-37.4254},{name:284.2,value:-37.581},{name:284.8,value:-38.525},{name:284.9,value:-38.6842},{name:285.5,value:-39.6507},{name:285.6,value:-39.8138},{name:286.2,value:-40.8041},{name:286.3,value:-40.9712},{name:286.8,value:-41.8161},{name:286.9,value:-41.9869},{name:287.4,value:-42.8509},{name:287.5,value:-43.0257},{name:288,value:-43.91},{name:288.1,value:-44.089},{name:288.6,value:-44.9948},{name:288.7,value:-45.1782},{name:289.2,value:-46.1066},{name:289.3,value:-46.2947},{name:289.8,value:-47.247},{name:289.9,value:-47.4399},{name:290.4,value:-48.4172},{name:290.5,value:-48.6152},{name:290.9,value:-49.416},{name:291,value:-49.6184},{name:291.4,value:-50.437},{name:291.5,value:-50.6439},{name:291.9,value:-51.4806},{name:292,value:-51.692},{name:292.4,value:-52.5467},{name:292.5,value:-52.7627},{name:292.9,value:-53.6354},{name:293,value:-53.8557},{name:293.4,value:-54.7458},{name:293.5,value:-54.9704},{name:293.9,value:-55.8769},{name:294,value:-56.1054},{name:294.4,value:-57.0269},{name:294.5,value:-57.259},{name:294.9,value:-58.1934},{name:295,value:-58.4284},{name:295.4,value:-59.3732},{name:295.5,value:-59.6104},{name:295.9,value:-60.5622},{name:296,value:-60.8007},{name:296.4,value:-61.7557},{name:296.5,value:-61.9945},{name:296.9,value:-62.9482},{name:297,value:-63.1861},{name:297.4,value:-64.1337},{name:297.5,value:-64.3694},{name:297.9,value:-65.3056},{name:298,value:-65.5377},{name:298.4,value:-66.4573},{name:298.5,value:-66.6846},{name:298.9,value:-67.5822},{name:299,value:-67.8035},{name:299.4,value:-68.6743},{name:299.5,value:-68.8883},{name:299.9,value:-69.7279},{name:300,value:-69.9336},{name:300.4,value:-70.7383},{name:300.5,value:-70.9348},{name:301,value:-71.8883},{name:301.1,value:-72.073},{name:301.6,value:-72.9658},{name:301.7,value:-73.1381},{name:302.3,value:-74.1276},{name:302.4,value:-74.2851},{name:303,value:-75.186},{name:303.1,value:-75.3289},{name:303.8,value:-76.2716},{name:303.9,value:-76.3983},{name:304.7,value:-77.3429},{name:304.8,value:-77.4526},{name:305.7,value:-78.3624},{name:305.8,value:-78.4552},{name:307,value:-79.4528},{name:307.1,value:-79.5269},{name:308.6,value:-80.4941},{name:308.7,value:-80.5499},{name:310.8,value:-81.5161},{name:310.9,value:-81.5537},{name:314.5,value:-82.5404},{name:314.6,value:-82.5598},{name:324.7,value:-83.505},{name:334.8,value:-83.7749},{name:344.9,value:-83.9414},{name:355,value:-84.0833},{name:365.1,value:-84.2116},{name:375.2,value:-84.3283},{name:385.3,value:-84.4341},{name:395.4,value:-84.5295},{name:405.5,value:-84.6154},{name:415.6,value:-84.6924},{name:425.7,value:-84.7614},{name:435.8,value:-84.8232},{name:445.9,value:-84.8786},{name:456,value:-84.9282},{name:466.1,value:-84.9727},{name:476.2,value:-85.0126},{name:486.3,value:-85.0485},{name:496.4,value:-85.0808},{name:506.5,value:-85.1099},{name:516.6,value:-85.1361},{name:526.7,value:-85.1599},{name:536.8,value:-85.1814},{name:546.9,value:-85.2009},{name:557,value:-85.2186},{name:567.1,value:-85.2347},{name:577.2,value:-85.2493},{name:587.3,value:-85.2627},{name:597.4,value:-85.2748},{name:607.5,value:-85.286},{name:617.6,value:-85.2962},{name:627.7,value:-85.3055},{name:637.8,value:-85.314},{name:647.9,value:-85.3219},{name:658,value:-85.3291},{name:668.1,value:-85.3358},{name:678.2,value:-85.3419},{name:688.3,value:-85.3475},{name:698.4,value:-85.3527},{name:708.5,value:-85.3576},{name:718.6,value:-85.362},{name:728.7,value:-85.3662},{name:738.8,value:-85.37},{name:748.9,value:-85.3736},{name:759,value:-85.3769},{name:769.1,value:-85.38},{name:779.2,value:-85.3828},{name:789.3,value:-85.3855},{name:799.4,value:-85.3881},{name:809.5,value:-85.3904},{name:819.6,value:-85.3926},{name:829.7,value:-85.3947},{name:839.8,value:-85.3967},{name:849.9,value:-85.3985},{name:860,value:-85.4003},{name:870.1,value:-85.4019},{name:880.2,value:-85.4035},{name:890.3,value:-85.405},{name:900.4,value:-85.4064},{name:910.5,value:-85.4078},{name:920.6,value:-85.409},{name:930.7,value:-85.4103},{name:940.8,value:-85.4115},{name:950.9,value:-85.4126},{name:961,value:-85.4137},{name:971.1,value:-85.4148},{name:981.2,value:-85.4158},{name:991.3,value:-85.4168}]},{name:'1000',series:[{name:-5,value:-85.4171},{name:0,value:-85.4176},{name:0.1,value:-80.259},{name:0.2,value:-75.162},{name:0.3,value:-70.112},{name:0.4,value:-65.0771},{name:0.5,value:-59.9727},{name:0.6,value:-54.5087},{name:0.7,value:-47.654},{name:0.8,value:-35.742},{name:0.9,value:-7.28432},{name:1,value:23.4784},{name:1.1,value:33.4992},{name:1.2,value:36.6416},{name:1.6,value:35.898},{name:1.7,value:35.0889},{name:1.8,value:34.2326},{name:1.9,value:33.3557},{name:2,value:32.4768},{name:2.1,value:31.6103},{name:2.2,value:30.7671},{name:2.3,value:29.9556},{name:2.4,value:29.1817},{name:2.5,value:28.4498},{name:2.6,value:27.7628},{name:2.7,value:27.122},{name:2.8,value:26.528},{name:2.9,value:25.9802},{name:3.1,value:25.0163},{name:3.2,value:24.5961},{name:3.4,value:23.8693},{name:3.5,value:23.5579},{name:3.9,value:22.5906},{name:4,value:22.3994},{name:4.5,value:21.4164},{name:4.6,value:21.16},{name:4.9,value:20.3006},{name:5,value:20.0083},{name:5.3,value:19.1796},{name:5.4,value:18.9267},{name:5.8,value:18.0486},{name:5.9,value:17.8617},{name:6.6,value:16.863},{name:6.7,value:16.7582},{name:14.5,value:17.7524},{name:14.6,value:17.7955},{name:16.9,value:18.7763},{name:17,value:18.8182},{name:19.4,value:19.7979},{name:19.5,value:19.8375},{name:22.1,value:20.8356},{name:22.2,value:20.8728},{name:24.9,value:21.8556},{name:25,value:21.8913},{name:27.9,value:22.8694},{name:28,value:22.9},{name:31.9,value:23.8929},{name:32,value:23.9134},{name:39.8,value:24.9095},{name:39.9,value:24.9162},{name:50,value:25.1503},{name:60.1,value:24.948},{name:70.2,value:24.5833},{name:80.3,value:24.1175},{name:90.4,value:23.5593},{name:100.5,value:22.9091},{name:110.6,value:22.1675},{name:120.7,value:21.3347},{name:130.7,value:20.4192},{name:140.6,value:19.4199},{name:140.7,value:19.4093},{name:149.7,value:18.4133},{name:149.8,value:18.4017},{name:158,value:17.4139},{name:158.1,value:17.4013},{name:165.7,value:16.4088},{name:165.8,value:16.3952},{name:172.8,value:15.4065},{name:172.9,value:15.3918},{name:179.4,value:14.4008},{name:179.5,value:14.385},{name:185.5,value:13.3989},{name:185.6,value:13.3819},{name:191.2,value:12.3911},{name:191.3,value:12.3728},{name:196.5,value:11.3834},{name:196.6,value:11.3637},{name:201.4,value:10.3832},{name:201.5,value:10.3621},{name:206,value:9.37664},{name:206.1,value:9.35397},{name:210.3,value:8.36931},{name:210.4,value:8.34506},{name:214.3,value:7.36805},{name:214.4,value:7.34217},{name:218.1,value:6.35338},{name:218.2,value:6.32579},{name:221.7,value:5.32943},{name:221.8,value:5.30007},{name:225.1,value:4.30129},{name:225.2,value:4.2701},{name:228.3,value:3.27501},{name:228.4,value:3.24198},{name:231.3,value:2.25747},{name:231.4,value:2.22259},{name:234.1,value:1.25617},{name:234.2,value:1.21945},{name:236.8,value:0.240409},{name:236.9,value:0.201799},{name:239.4,value:-0.787467},{name:239.5,value:-0.828023},{name:241.9,value:-1.8253},{name:242,value:-1.86788},{name:244.2,value:-2.82667},{name:244.3,value:-2.87128},{name:246.4,value:-3.83035},{name:246.5,value:-3.87712},{name:248.5,value:-4.83481},{name:248.6,value:-4.88386},{name:250.5,value:-5.83854},{name:250.6,value:-5.89003},{name:252.4,value:-6.83991},{name:252.5,value:-6.89401},{name:254.3,value:-7.8938},{name:254.4,value:-7.95085},{name:256.1,value:-8.9468},{name:256.2,value:-9.00699},{name:257.8,value:-9.99609},{name:257.9,value:-10.0596},{name:259.4,value:-11.0379},{name:259.5,value:-11.1048},{name:260.9,value:-12.0673},{name:261,value:-12.1378},{name:262.3,value:-13.0784},{name:262.4,value:-13.1526},{name:263.7,value:-14.1423},{name:263.8,value:-14.2204},{name:265,value:-15.1808},{name:265.1,value:-15.2628},{name:266.2,value:-16.1855},{name:266.3,value:-16.2713},{name:267.4,value:-17.2368},{name:267.5,value:-17.3266},{name:268.5,value:-18.2432},{name:268.6,value:-18.3368},{name:269.6,value:-19.292},{name:269.7,value:-19.3894},{name:270.7,value:-20.3842},{name:270.8,value:-20.4857},{name:271.7,value:-21.4157},{name:271.8,value:-21.5209},{name:272.7,value:-22.4846},{name:272.8,value:-22.5935},{name:273.7,value:-23.5911},{name:273.8,value:-23.7039},{name:274.6,value:-24.6196},{name:274.7,value:-24.7358},{name:275.5,value:-25.679},{name:275.6,value:-25.7986},{name:276.4,value:-26.7694},{name:276.5,value:-26.8925},{name:277.3,value:-27.8911},{name:277.4,value:-28.0177},{name:278.1,value:-28.9145},{name:278.2,value:-29.0442},{name:278.9,value:-29.963},{name:279,value:-30.0958},{name:279.7,value:-31.0368},{name:279.8,value:-31.1728},{name:280.5,value:-32.1364},{name:280.6,value:-32.2757},{name:281.3,value:-33.2624},{name:281.4,value:-33.405},{name:282,value:-34.2699},{name:282.1,value:-34.4156},{name:282.7,value:-35.2991},{name:282.8,value:-35.4479},{name:283.4,value:-36.3506},{name:283.5,value:-36.5027},{name:284.1,value:-37.4256},{name:284.2,value:-37.5811},{name:284.8,value:-38.5252},{name:284.9,value:-38.6844},{name:285.5,value:-39.6509},{name:285.6,value:-39.8139},{name:286.2,value:-40.8042},{name:286.3,value:-40.9714},{name:286.8,value:-41.8162},{name:286.9,value:-41.9871},{name:287.4,value:-42.8511},{name:287.5,value:-43.0259},{name:288,value:-43.9102},{name:288.1,value:-44.0892},{name:288.6,value:-44.995},{name:288.7,value:-45.1784},{name:289.2,value:-46.1068},{name:289.3,value:-46.2948},{name:289.8,value:-47.2471},{name:289.9,value:-47.4401},{name:290.4,value:-48.4173},{name:290.5,value:-48.6154},{name:290.9,value:-49.4162},{name:291,value:-49.6186},{name:291.4,value:-50.4372},{name:291.5,value:-50.6441},{name:291.9,value:-51.4808},{name:292,value:-51.6922},{name:292.4,value:-52.547},{name:292.5,value:-52.7629},{name:292.9,value:-53.6356},{name:293,value:-53.8559},{name:293.4,value:-54.746},{name:293.5,value:-54.9706},{name:293.9,value:-55.8771},{name:294,value:-56.1057},{name:294.4,value:-57.0271},{name:294.5,value:-57.2592},{name:294.9,value:-58.1936},{name:295,value:-58.4286},{name:295.4,value:-59.3734},{name:295.5,value:-59.6106},{name:295.9,value:-60.5624},{name:296,value:-60.8009},{name:296.4,value:-61.7559},{name:296.5,value:-61.9947},{name:296.9,value:-62.9485},{name:297,value:-63.1863},{name:297.4,value:-64.1339},{name:297.5,value:-64.3696},{name:297.9,value:-65.3058},{name:298,value:-65.5379},{name:298.4,value:-66.4575},{name:298.5,value:-66.6848},{name:298.9,value:-67.5824},{name:299,value:-67.8037},{name:299.4,value:-68.6745},{name:299.5,value:-68.8885},{name:299.9,value:-69.7281},{name:300,value:-69.9338},{name:300.4,value:-70.7385},{name:300.5,value:-70.935},{name:301,value:-71.8885},{name:301.1,value:-72.0732},{name:301.6,value:-72.966},{name:301.7,value:-73.1383},{name:302.3,value:-74.1278},{name:302.4,value:-74.2853},{name:303,value:-75.1862},{name:303.1,value:-75.329},{name:303.8,value:-76.2717},{name:303.9,value:-76.3984},{name:304.7,value:-77.343},{name:304.8,value:-77.4527},{name:305.7,value:-78.3625},{name:305.8,value:-78.4553},{name:307,value:-79.4529},{name:307.1,value:-79.527},{name:308.6,value:-80.4942},{name:308.7,value:-80.5499},{name:310.8,value:-81.5162},{name:310.9,value:-81.5537},{name:314.5,value:-82.5404},{name:314.6,value:-82.5598},{name:324.7,value:-83.5051},{name:334.8,value:-83.7749},{name:344.9,value:-83.9414},{name:355,value:-84.0833},{name:365.1,value:-84.2116},{name:375.2,value:-84.3283},{name:385.3,value:-84.4341},{name:395.4,value:-84.5295},{name:405.5,value:-84.6154},{name:415.6,value:-84.6924},{name:425.7,value:-84.7614},{name:435.8,value:-84.8232},{name:445.9,value:-84.8786},{name:456,value:-84.9282},{name:466.1,value:-84.9727},{name:476.2,value:-85.0126},{name:486.3,value:-85.0485},{name:496.4,value:-85.0808},{name:506.5,value:-85.1099},{name:516.6,value:-85.1361},{name:526.7,value:-85.1599},{name:536.8,value:-85.1814},{name:546.9,value:-85.2009},{name:557,value:-85.2186},{name:567.1,value:-85.2347},{name:577.2,value:-85.2493},{name:587.3,value:-85.2627},{name:597.4,value:-85.2748},{name:607.5,value:-85.286},{name:617.6,value:-85.2962},{name:627.7,value:-85.3055},{name:637.8,value:-85.314},{name:647.9,value:-85.3219},{name:658,value:-85.3291},{name:668.1,value:-85.3358},{name:678.2,value:-85.3419},{name:688.3,value:-85.3475},{name:698.4,value:-85.3527},{name:708.5,value:-85.3576},{name:718.6,value:-85.362},{name:728.7,value:-85.3662},{name:738.8,value:-85.37},{name:748.9,value:-85.3736},{name:759,value:-85.3769},{name:769.1,value:-85.38},{name:779.2,value:-85.3828},{name:789.3,value:-85.3855},{name:799.4,value:-85.3881},{name:809.5,value:-85.3904},{name:819.6,value:-85.3926},{name:829.7,value:-85.3947},{name:839.8,value:-85.3967},{name:849.9,value:-85.3985},{name:860,value:-85.4003},{name:870.1,value:-85.4019},{name:880.2,value:-85.4035},{name:890.3,value:-85.405},{name:900.4,value:-85.4064},{name:910.5,value:-85.4078},{name:920.6,value:-85.409},{name:930.7,value:-85.4103},{name:940.8,value:-85.4115},{name:950.9,value:-85.4126},{name:961,value:-85.4137},{name:971.1,value:-85.4148},{name:981.2,value:-85.4158},{name:991.3,value:-85.4168}]}];
  */

  vrGraphData: any[] = [];

  multi: any[] = [];
  multiStore: string;

  gradient = false;
  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  legendTitle = 'Conc (µM)';
  xAxisLabel = 'Time (ms)';
  yAxisLabel = 'Membrane Voltage (mV)';

  /**
   * Initialising constructor.
   *
   * @param apPredictConfigService `ApPredict` simulations default values configuration service.
   * @param simulationService Service for managing simulations.
   * @param router Angular app routing mechanism.
   * @param route Angular activated route.
   */
  constructor(private apPredictConfigService: AppredictConfigService,
              @Inject('ProvidedSimulationService') private simulationService: SimulationService,
              private router: Router, private route: ActivatedRoute) { }

  /**
   * Angular hook - initialisation routine.
   */
  ngOnDestroy() {
    if (this.myTimer !== undefined) {
      // Perhaps historical results were viewed, i.e. no need for timered query of app-manager.
      this.myTimer.unsubscribe();
    }

    this.shown = false;
  }

  /**
   * Angular hook - initialisation routine.
   */
  ngOnInit() {
    this.configModels = this.apPredictConfigService.models;
    var modelMap = {};

    this.configModels.forEach((model) => {
      modelMap[model.id] = model;
    });

    this.shown = false;
    // https://angular.io/guide/router#activated-route-in-action
    this.simulationId = this.route.snapshot.params['id'];

    if (this.simulationId === null) {
      console.log("Oops! No simulationId in the request parameter map!");
      return;
    }

    var localStorageItem = localStorage.getItem(this.simulationId + '_' + LocalStorageItem.APPREDICT_INPUT);
    var hasApPredictInput = (localStorageItem !== null);

    if (!hasApPredictInput) {
      console.log("Oops! No ApPredictInput in localStorage for " + this.simulationId);
      this.apPredictInput = new ApPredictInput();

      this.status = 'Simulation not found!';

      return;
    }

    var localStorageItemResults = localStorage.getItem(this.simulationId + '_' + LocalStorageItem.VOLTAGE_TRACES);
    var hasLocalStorageItemResults = (localStorageItemResults !== null);

    if (hasLocalStorageItemResults) {
      try {
        this.multi = JSON.parse(localStorageItemResults);
      } catch (e) {
        console.log("TODO : JSON parse error I : '" + localStorageItemResults + "'");
      }
      this.allVoltageResultsData = localStorage.getItem(this.simulationId + '_' + LocalStorageItem.VOLTAGE_RESULTS);
    }

    var localStorageIpAddress = localStorage.getItem(this.simulationId + '_' + LocalStorageItem.IP_ADDRESS);
    this.ipAddress = localStorageIpAddress;

    var apPredictInputStr = localStorageItem;
    try {
      this.apPredictInput = JSON.parse(apPredictInputStr);
    } catch (e) {
      console.log("TODO : JSON parse error II '" + apPredictInputStr + "'");
    }

    [ this.apPredictInput.IKr, this.apPredictInput.INa, this.apPredictInput.ICaL,
      this.apPredictInput.IKs, this.apPredictInput.IK1, this.apPredictInput.Ito,
      this.apPredictInput.INaL ].forEach((associatedItem, index, array) => {
      if (typeof associatedItem !== 'undefined') {
        if (displayData(associatedItem, AssociatedItemType.HILL) != '' ||
            displayData(associatedItem, AssociatedItemType.HILLSPREAD) != '' ||
            displayData(associatedItem, AssociatedItemType.PIC50SPREAD) != '' ||
            displayData(associatedItem, AssociatedItemType.SATURATION) != '') {
          this.showAllData = true;
          return;
        }
      }
    });

    let plasmaMinimum = +this.apPredictInput.plasmaMinimum;
    let plasmaMaximum = +this.apPredictInput.plasmaMaximum;
    if (plasmaMinimum == 0) {
      // Adjust plasma minimum to something which won't result in -infinity!
      plasmaMinimum = 0.001;
    }
    let startTick = Math.floor(this.log10(0.001));
    let endTick = Math.ceil(this.log10(plasmaMaximum));
    for (let tick = startTick; tick <= endTick; tick++) {
      this.vrXAxisTicks.push(tick);
    }
    

    var localStorageStdErr = localStorage.getItem(this.simulationId + '_' + LocalStorageItem.STDERR);
    if (localStorageStdErr !== null) {
      this.stdErr = localStorageStdErr;
    }
    var localStorageStdOut = localStorage.getItem(this.simulationId + '_' + LocalStorageItem.STDOUT);
    if (localStorageStdOut !== null) {
      this.stdOut = localStorageStdOut;
    }

    this.modelName = modelMap[this.apPredictInput.modelId].name;
    this.modelDescription = modelMap[this.apPredictInput.modelId].description;

    if (hasLocalStorageItemResults) {
      /* Viewing historical results */
      this.status = jobDone;
      return;
    }

    this.myTimer = timer(0, 500).subscribe(
      val => {
        this.simulationService.getOutput(this.simulationId,
                                         DataType.VOLTAGE_TRACES)
                              .subscribe(apPredictOutput => {
          if (apPredictOutput.hasWaitingMessage()) {
            this.vtMessage = apPredictOutput.message;
          } else if (apPredictOutput.hasData(DataType.VOLTAGE_TRACES)) {
            this.vtMessage = null;
            this.shown = true;

            var voltageTraces = apPredictOutput.voltageTraces;
            if (this.multiStore != voltageTraces) {
              this.multi = JSON.parse(voltageTraces);
              this.multiStore = voltageTraces;
            }
          } else {
            // No data - looks serious!
            this.vtMessage = null;
            this.errorMessage = apPredictOutput.message;
            this.myTimer.unsubscribe();
          }
        },error => {
          this.handleError(error);
        });

        this.simulationService.getOutput(this.simulationId,
                                         DataType.VOLTAGE_RESULTS)
                              .subscribe(apPredictOutput => {
          if (apPredictOutput.hasWaitingMessage()) {
            //
          } else if (apPredictOutput.hasData(DataType.VOLTAGE_RESULTS)) {
            this.allVoltageResultsData = apPredictOutput.voltageResults;
            if (this.currEnumIdx >= 0) {
              this.calculateVRGraphData(VoltageResultsType[VoltageResultsType[this.currEnumIdx]]);
            }
          }
        }, error => {
          this.handleError(error);
        });

        if (this.completed) {
          this.status = jobDone;
          this.myTimer.unsubscribe();

          localStorage.setItem(this.simulationId + '_' + LocalStorageItem.VOLTAGE_TRACES,
                               this.multiStore);
          localStorage.setItem(this.simulationId + '_' + LocalStorageItem.VOLTAGE_RESULTS,
                               this.allVoltageResultsData);
        } else {
          this.simulationService.getOutput(this.simulationId,
                                           DataType.STOP_INDICATOR)
                                .subscribe(apPredictOutput => {
            var completed = apPredictOutput.completed;
            if (completed !== undefined) {
              this.completed = completed;
            }
            if (this.completed) {
              /* Delay to accommodate presence of "sleep 1" in run_me.sh.
                 Without the timeout here this client would try to retrieve
                 stderr and stdout output from app-manager on receiving the
                 stop indicator, but app-manager would likely be in a paused
                 phase before updating post-run stderr and stdout files (and
                 therefore giving the impression of no available data). */
              // https://stackoverflow.com/questions/41106125/angular-2-using-this-inside-settimeout
              setTimeout(() => { this.retrieveStd() }, 1000);
            } else {
              this.simulationService.getOutput(this.simulationId,
                                               DataType.PROGRESS)
                                    .subscribe(apPredictOutput => {
                if (apPredictOutput.hasWaitingMessage()) {
                  this.progressMessage = apPredictOutput.message;
                } else if (apPredictOutput.hasData(DataType.PROGRESS)) {
                  this.status = ' Running ';
                  this.progressMessage = null;

                  let progress: string[] = JSON.parse(apPredictOutput.progress);
                  if (progress.length > 0) {
                    for (let idx=progress.length - 1; idx >= 0; --idx) {
                      let checkProgress = progress[idx];
                      if (checkProgress != '') {
                        if (checkProgress != this.status) {
                          this.status = checkProgress;
                        }
                        break;
                      }
                    }
                  }
                } else {
                  // No data - looks serious!
                  this.status = ' Error : No data from progress_status! ';
                  this.progressMessage = null;
                  this.errorMessage = apPredictOutput.message;
                }
              },error => {
                this.handleError(error);
              });
            }
          },error => {
            this.handleError(error);
          });
        }
    });
  }

  /**
   * @see {@link utility-functions#displayData() }
   */
  displayHill(associatedItem: AssociatedItem): string {
    return displayData(associatedItem, AssociatedItemType.HILL);
  }

  /**
   * @see {@link utility-functions#displayData() }
   */
  displayPIC50(associatedItem: AssociatedItem): string {
    return displayData(associatedItem, AssociatedItemType.PIC50);
  }

  /**
   * @see {@link utility-functions#displayData() }
   */
  displayPIC50Spread(associatedItem: AssociatedItem): string {
    return displayData(associatedItem, AssociatedItemType.PIC50SPREAD);
  }

  /**
   * @see {@link utility-functions#displayData() }
   */
  displaySaturation(associatedItem: AssociatedItem): string {
    return displayData(associatedItem, AssociatedItemType.SATURATION);
  }

  /**
   * Not quite as the name may suggest, this is to retrieve the StdErr and
   * StdOut (generally as generated by ApPredict + run_me.sh).
   */
  retrieveStd(): void {
    this.simulationService.getOutput(this.simulationId,
                                     DataType.STDERR)
                          .subscribe(apPredictOutput => {
      if (typeof apPredictOutput.stdErr !== 'undefined') {
        this.stdErr = apPredictOutput.stdErr;
        localStorage.setItem(this.simulationId + '_' + LocalStorageItem.STDERR,
                             this.stdErr);
      }
    },error => {
      this.handleError(error);
    });
    this.simulationService.getOutput(this.simulationId,
                                     DataType.STDOUT)
                          .subscribe(apPredictOutput => {
      if (typeof apPredictOutput.stdOut !== 'undefined') {
        this.stdOut = apPredictOutput.stdOut;
        localStorage.setItem(this.simulationId + '_' + LocalStorageItem.STDOUT,
                             this.stdOut);
      }
    },error => {
      this.handleError(error);
    });
  }

  onSelect() : void {
    //
  }

  /**
   * Handle backend errors.
   *
   * @param error Error to handle.
   * @link https://angular.io/guide/http#getting-error-details
   */
  private handleError(error) {
    if (typeof error.message !== 'undefined') {
      if (error.message == 'Http failure response for (unknown url): 0 Unknown Error') {
        // 'app-manager' or 'datastore' didn't start or has stopped (or network problem)?
        this.errorMessage = 'Error encountered communicating with the simulation results source!';
      } else {
        this.errorMessage = error.message;
      }
    } else {
      this.errorMessage = JSON.stringify(error);
    }
    this.myTimer.unsubscribe();
  };

  /**
   * Display VoltageResult.dat data, according to specified type.
   *
   * @param type Voltage result data type to display.
   */
  calculateVRGraphData(type: VoltageResultsType) : void {
    let allVRData;
    try {
      allVRData = JSON.parse(this.allVoltageResultsData);
    } catch (e) {
      // May well be that there's no simulation results arrived yet.
    }

    let chartData = new ChartData(type);
    this.vrGraphTitle = chartData.yAxisLabel + ' vs. ' + chartData.xAxisLabel;
    let plotName = chartData.dataTitle + this.apPredictInput.pacingFrequency + 'Hz';

    this.vrGraphData = [];

    let seriesData = [];
    let credItvlSeriesData = [];

    if (typeof allVRData !== 'undefined' && 
        Array.isArray(allVRData) &&
        allVRData.length >= 2) {
      let deltaAPD90ColHdr = allVRData[0].da90;

      // idx@0 is the header line!
      for (let idx = 1; idx < allVRData.length; idx++) {
        let conc = +allVRData[idx].c;
        if (conc >= 0.000000000000001) {
          let conc = this.log10(+allVRData[idx].c);

          chartData.xScaleMax = conc;
          chartData.yScaleMax = conc;

          let yVar;
          if (type == VoltageResultsType.DELTA_APD90) {
            // Provisionally only process non-credible interval data
            yVar = allVRData[idx].da90;
            if (Array.isArray(yVar)) {
              if (yVar.length == 1) {
                let useVar = yVar[0];
                if (!isNaN(Number(useVar))) {
                  useVar = +useVar;
                  chartData.yScaleMax = useVar;
                  chartData.yScaleMin = useVar;
                  seriesData.push({ 'name': conc, 'value': useVar });

                  this.vrGraphData = [ { 'name': plotName,
                                         'series': seriesData } ];
                } else {
                  if (!useVar.startsWith('NoActionPotential_')) {
                    console.log('Non-numeric value ' + useVar + ' for ' + type + ' at conc ' + conc);
                  }
                }
              } else {
                for (let credItvlIdx = 0; credItvlIdx < yVar.length; credItvlIdx++) {
                  let useVar = yVar[credItvlIdx];
                  if (!isNaN(Number(useVar))) {
                    let credItvlVal = +useVar;
                    chartData.yScaleMax = credItvlVal;
                    chartData.yScaleMin = credItvlVal;
               
                    if (typeof credItvlSeriesData[credItvlIdx] === 'undefined') {
                      credItvlSeriesData[credItvlIdx] = [];
                    }
                    credItvlSeriesData[credItvlIdx].push({ 'name': conc,
                                                           'value': credItvlVal });
                  } else {
                    if (!useVar.startsWith('NoActionPotential_')) {
                      console.log('Non-numeric value ' + useVar + ' for ' + type + ' at conc ' + conc);
                    }
                  }
                }
              }
            }
          } else {
            let useVar;
            switch (type) {
              case VoltageResultsType.APD50:
                useVar = allVRData[idx].a50;
                break;
              case VoltageResultsType.APD90:
                useVar = allVRData[idx].a90;
                break;
              case VoltageResultsType.PEAK_VM:
                useVar = allVRData[idx].pv;
                break;
              case VoltageResultsType.UPSTROKE_VELOCITY:
                useVar = allVRData[idx].uv;
                break;
              default:
                console.error('Unknown type ' + type);            
                break;
            }

            if (typeof useVar !== 'undefined' &&
                !isNaN(Number(useVar))) {
              useVar = +useVar;
              chartData.yScaleMax = useVar;
              chartData.yScaleMin = useVar;

              seriesData.push({ 'name': conc, 'value': useVar });

              this.vrGraphData = [ { 'name': plotName,
                                     'series': seriesData } ];
            } else {
              if (!useVar.startsWith('NoActionPotential_')) {
                console.log('Non-numeric value ' + useVar + ' for ' + type + ' at conc ' + conc);
              }
            }
          }
        }
      }
      if (credItvlSeriesData.length > 0) {
        let tmpColorScheme = { domain: [] }
        let csIdx = Math.round(credItvlSeriesData.length / 2) - 1;
        for (let credItvlIdx = credItvlSeriesData.length - 1; credItvlIdx >= 0; credItvlIdx--) {
          let name = deltaAPD90ColHdr[credItvlIdx];
          name = name.replace('dAp','');
          name = name.replace('%', '% ');
          this.vrGraphData.push({ 'name': name,
                                  'series': credItvlSeriesData[credItvlIdx] });
          tmpColorScheme.domain.push(this.colorScheme.domain[Math.abs(csIdx--)]);
        }
        this.vrColorScheme = tmpColorScheme;
      } else {
        this.vrColorScheme = this.colorScheme;
      }
      this.vrLegendTitle = chartData.legendTitle;

      this.vrXAxisLabel = chartData.xAxisLabel;
      this.vrYAxisLabel = chartData.yAxisLabel;
      this.vrYScaleMin = chartData.yScaleMin;
      this.vrYScaleMax = chartData.yScaleMax;
      this.vrXScaleMin = chartData.xScaleMin;
      this.vrXScaleMax = chartData.xScaleMax;
    }

    this.vrGraphData = [...this.vrGraphData];

  }

  /**
   * Retrieve the inverse common log (base 10) value.
   *
   * @param value Number to invert.
   * @return Inverse value.
   */
  inverse(value: number) : number {
    return Math.pow(10, value);
  }

  /**
   * Retrieve the log 10 value.
   *
   * @param value Value to log.
   * @return Log value.
   */
  log10(value: number) : number {
    return Math.log(value) / Math.log(10);
  }

  /**
   * Swap between the graph displays.
   */
  toggleGraph() : void {
    this.vrGraphTitle = '';

    let typeCount= Object.keys(VoltageResultsType).length / 2;
    if (this.toggled) {
      this.toggled = !this.toggled;

      this.calculateVRGraphData(VoltageResultsType[VoltageResultsType[++this.currEnumIdx]]);
    } else {
      if (this.currEnumIdx == typeCount - 1) {
        this.toggled = !this.toggled;
        this.currEnumIdx = -1;
      } else {
        this.calculateVRGraphData(VoltageResultsType[VoltageResultsType[++this.currEnumIdx]]);
      }
    }
  }

  /**
    * Toggle the ApPredict stderr and stdout display.
    *
    * @param std Display to toggle, i.e. 'err' or 'out'.
    */
  toggleStdDisplay(std: string) : void {
    if (std == 'err') {
      this.showStdErr = !this.showStdErr;
      this.showHideStdErr = this.showStdErr ? this.titleHide : this.titleShow;
    } else if (std == 'out') {
      this.showStdOut = !this.showStdOut;
      this.showHideStdOut = this.showStdOut ? this.titleHide : this.titleShow;
    } else {
      console.error('Unrecognised std display flag of ' + std);
    }
  }

  /**
   * Navigate to the user input page.
   */
  viewInputPage() : void {
    AppRoutingModule.goToInputPage(this.router);
  }

  /**
   * Navigate to the user input page (using simulation input as template).
   */
  viewInputPageAsTemplate() : void {
    // TODO: View simulation input page passing current simulation input as template.
  }

  /**
   * Navigate to the 'simulations' view page.
   */
  viewSimulationsPage() : void {
    AppRoutingModule.goToSimulationsPage(this.router);
  }

  /**
   * Format the x-axis values.
   *
   * @param value Value to format.
   * @return Formatted value.
   */
  xAxisTickFormatting(value) {
    return this.inverse(value);
  }
}
