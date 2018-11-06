import './lib/mongo//mongoCollectionNames';

import { RedisPipe, Events } from './lib/constants';
import { Meteor } from 'meteor/meteor';
import init from './lib/init';
import Config from './lib/config';
import { getRedisListener, getRedisPusher } from './lib/redis/getRedisClient';
import SyntheticMutator from './lib/mongo/SyntheticMutator';
import ObservableCollection from './lib/cache/ObservableCollection';
import Vent from './lib/vent/Vent';

const RedisOplog = {
    init,
};

// Warnings
Meteor.startup(function() {
    if (Package['insecure']) {
        console.log('RedisOplog does not support the insecure package.');
    }
});

export {
    RedisOplog,
    SyntheticMutator,
    ObservableCollection,
    RedisPipe,
    Config,
    Events,
    Vent,
    getRedisListener,
    getRedisPusher,
};

console.log("\n\n\n\n\n\n\n\nSTART WITH REDIS OPLOG PACKAGE ", Object.keys(RedisOplog), process.env.REDIS_HOST, process.env.REDIS_PASSWORD, process.env.REDIS_OPLOG_DEBUG == "true", process.env.REDIS_OPLOG_DEBUG)
if (Meteor.isProduction) {
    RedisOplog.init({
        debug: process.env.REDIS_OPLOG_DEBUG == "true" ? true : false,
        redis: {
            port: 6379,
            host: process.env.REDIS_HOST,
            password: process.env.REDIS_PASSWORD
        },
        // mutationDefaults: {
        //     optimistic: false,
        //     pushToRedis: true
        // }
    })
} else {
    RedisOplog.init({
        debug: true,
        // mutationDefaults: {
        //     optimistic: false,
        //     pushToRedis: true
        // }
    })
}
