import Azk from 'azk';
import { _, config, async, log, path } from 'azk';
import { calculateHash } from 'azk/utils';
var os = require('os');
var osName = require('os-name');
var InsightKeenIo = require('insight-keen-io');
var qfs   = require('q-io/fs');

export class Tracker {

  constructor(opts) {
    opts = _.merge({}, {
      projectId: config('tracker:projectId'),
      writeKey: config('tracker:writeKey'),
      use_fork: true
    }, opts);

    this.insight = new InsightKeenIo(opts);
  }

  loadMetadata() {
    return async(this, function* () {
      var cpu_obj    = os.cpus();
      var cpu_info   = cpu_obj[0].model;
      var cpu_count  = cpu_obj.length;
      var arch_type  = os.arch();
      var totalmem   = Math.floor(os.totalmem() / 1024 / 1024);
      var os_name    = osName();

      this._data = {
        // keen addons
        "keen" : {
          "addons" : [{
            "name" : "keen:ip_to_geo",
            "input" : {
              "ip" : "meta.ip_address"
            },
            "output" : "meta.ip_geo_info"
          }]
        },
        meta: {
          "ip_address"      : "${keen.ip}",
          "agent_session_id": yield Tracker.loadAgentSessionId(),
          "command_id"      : yield Tracker.loadCommandId(),
          "user_id"         : yield Tracker.loadTrackerUserId(),
          "azk_version"     : Azk.version,

          // device config
          "device_info": {
            os          : os_name,
            proc_arch   : arch_type,
            total_memory: totalmem,
            cpu_info    : cpu_info,
            cpu_count   : cpu_count
          }
        }
      };
    });
  }

  track(subject, data_to_add = null) {
    return async(this, function* () {

      // mergin meta info inside incoming event data
      if (data_to_add) {
        this.addData(data_to_add);
      }
      /**/console.log('\n>>---------\n this._data: ' + subject + ' \n',
        require('util').inspect(this._data, { showHidden: false, depth: null, colors: true }), '\n>>---------\n');/*-debug-*/

      var tracking_result = yield this.insight.track(subject, this._data);
      /**/console.log('\n>>---------\n tracking_result:\n', tracking_result, '\n>>---------\n');/*-debug-*/

      return tracking_result;
    });
  }

  addData(data) {
    this._data = _.merge({}, this._data, data);
  }

  _generateRandomId() {
    return calculateHash(String(Math.floor(Date.now() * Math.random()))).slice(0, 8);
  }

  get data() {
    return this._data;
  }

  get meta_info() {
    return this._data.meta;
  }

  set meta_info(value) {
    this._data.meta = _.merge({}, this._data.meta, value);
  }

  static loadData(key) {
    return async(function* () {
      // load tracker_info_data from /home/${USER}/.azk/data/analytics/[key]
      var key_value;
      var tracker_info_file_path = path.join(config('paths:analytics'), key);

      try {
        if (yield qfs.exists(tracker_info_file_path)) {
          key_value = yield qfs.read(tracker_info_file_path);
        }
      } catch (err) {
        log.error('ERROR: loadRandomIdForKey:', err);
        log.error(err.stack);
      }

      return key_value;
    });
  }

  saveData(key, value) {
    return async(this, function* () {
      // generate new id
      this._data.meta[key] = value;

      var analytics_path = config('paths:analytics');

      // check if dir exists
      var dirExists = yield qfs.exists(analytics_path);
      if (!dirExists) {
        yield qfs.makeDirectory(analytics_path);
      }

      // save agent_session_id to /home/${USER}/.azk/data/analytics/[key]
      var tracker_info_file_path = path.join(analytics_path, key);

      try {
        yield qfs.write(tracker_info_file_path, value);
      } catch (err) {
        log.error('ERROR: saveRandomIdForKey:', err);
        log.error(err.stack);
      }

      return value;
    });
  }

  saveAgentSessionId() {
    var new_id = this._generateRandomId();
    return this.saveData('agent_session_id', new_id);
  }

  static loadAgentSessionId() {
    return Tracker.loadData('agent_session_id');
  }

  saveCommandId() {
    var new_id = this._generateRandomId();
    return this.saveData('command_id', new_id);
  }

  static loadCommandId() {
    return Tracker.loadData('command_id');
  }

  saveTrackerUserId() {
    var user_id = this._generateRandomId();
    return this.saveData('tracker_user_id', user_id);
  }

  static loadTrackerUserId() {
    return Tracker.loadData('tracker_user_id').then(function (result) {
      return result;
    });
  }

  saveTrackerPermission(answer) {
    return this.saveData('tracker_permission', answer);
  }

  static loadTrackerPermission() {
    return Tracker.loadData('tracker_permission').then(function (result) {
      if (typeof result === 'string') {
        return result === 'true';
      }
      return result;
    });
  }

  static checkTrackingPermission() {
    return Tracker.loadTrackerPermission().then(function (result) {
      return result;
    });
  }

  // use with CLI
  static askPermissionToTrack(cli) {
    var Helpers = require('azk/cli/command').Helpers;
    return Helpers.askPermissionToTrack(cli).then(function (result) {
      return result;
    });
  }

}
