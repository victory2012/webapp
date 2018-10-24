<template>
  <div>
    <mt-header :title="$t('addDevice.title')">
      <router-link to="/device" slot="left">
        <mt-button icon="back">{{$t('addDevice.back')}}</mt-button>
      </router-link>
    </mt-header>
    <div class="forms">
      <ul>
        <li>
          <div class="title">{{$t('addDevice.deviceCode')}}</div>
          <div>
            <input v-model="deviceId" type="text">
          </div>
        </li>
        <li>
          <div class="title">{{$t('addDevice.manufacturer')}}</div>
          <div @click="chooseMani">
            {{manufacturer}}
          </div>
        </li>
        <li>
          <div class="title">{{$t('addDevice.Customer')}}</div>
          <div @click="chooseCustomr">{{customerValu}}</div>
        </li>
      </ul>
      <button @click="creatDevice" class="creatBtn">{{$t('addDevice.createBtn')}}</button>
    </div>
    <mt-popup v-model="popupVisible" class="popup" position="bottom">
      <mt-picker :slots="manu" @change="onValuesChange"></mt-picker>
    </mt-popup>
    <mt-popup v-model="CusVisible" class="popup" position="bottom">
      <mt-picker :slots="customer" @change="CusVisibleChange"></mt-picker>
    </mt-popup>
  </div>
</template>
<script>
import { Header, Field, Popup, Picker } from "mint-ui";
import {
  createDeviceList,
  enterpriseList,
  enterpriseCustomer
} from "../../api/index";
import { onError, onSuccess } from "../../utils/callback";

export default {
  components: {
    "mt-header": Header,
    "mt-field": Field,
    "mt-popup": Popup,
    "mt-picker": Picker
  },
  data() {
    return {
      device: {},
      CusVisible: false,
      popupVisible: false,
      manufacturer: "",
      customerValu: "",
      deviceId: "",
      manufacturerOptions: {},
      customerOptions: {},
      manu: [
        {
          values: []
        }
      ],
      customer: [
        {
          values: []
        }
      ]
    };
  },
  mounted() {
    this.getAddData();
  },
  methods: {
    onValuesChange(picker, value) {
      this.manufacturer = value[0];
      console.log(this.manufacturerOptions[value[0]]);
    },
    CusVisibleChange(picker, value) {
      this.customerValu = value[0];
    },
    chooseMani() {
      this.popupVisible = !this.popupVisible;
    },
    chooseCustomr() {
      this.CusVisible = !this.CusVisible;
    },
    getAddData() {
      // 生产企业列表
      enterpriseList().then(res => {
        if (res.data && res.data.code === 0) {
          let result = res.data.data;
          this.manu[0].values = [];
          if (result.length > 0) {
            result.forEach(key => {
              this.manu[0].values.push(key.name);
              this.manufacturerOptions[key.name] = key;
            });
          } else {
            this.manu[0].values.push(`${this.$t("addDevice.noData")}`);
          }
        }
      });
      enterpriseCustomer()
        // 客户企业列表
        .then(res => {
          if (res.data && res.data.code === 0) {
            let data = res.data.data;
            this.customer[0].values = [];
            if (data.length > 0) {
              data.forEach(key => {
                this.customer[0].values.push(key.name);
                this.customerOptions[key.name] = key;
              });
            } else {
              this.customer[0].values.push(`${this.$t("addDevice.noData")}`);
            }
          }
        });
    },
    creatDevice() {
      let manufacturer = this.manufacturerOptions[this.manufacturer];
      let keys = Object.keys(this.customerOptions);
      let customer =
        keys.length > 0
          ? this.customerOptions[this.customerValu]
          : { id: "", name: "" };
      let params = {
        manufacturerId: manufacturer.id || "",
        customerId: customer.id || "",
        deviceId: this.deviceId,
        manufacturerName: manufacturer.name || "",
        customerName: customer.name || ""
      };
      console.log(customer);
      console.log(params);
      if (!this.deviceId) {
        onError(`${this.$t("addDevice.errorTip")}`);
        return;
      }
      createDeviceList(params).then(res => {
        console.log(res);
        if (res.data && res.data.code === 0) {
          onSuccess(`${this.$t("addDevice.success")}`);
          this.deviceId = "";
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
@import url("../../common/style/index.scss");
.mint-header {
  background: #ffffff;
  color: #394750;
  border-bottom: 1px solid #e5e5e5;
}
.forms {
  padding: px2rem(80px) px2rem(20px) 0;
  font-size: px2rem(14px);
  .creatBtn {
    display: block;
    width: 100%;
    height: 40px;
    background: #26a2ff;
    color: #ffffff;
    border-radius: 3px;
    margin: px2rem(40px) auto;
  }
  li {
    display: flex;
    height: px2rem(50px);
    line-height: px2rem(50px);
    border-bottom: 1px dashed #9b9b9b;
    div {
      flex: 1;
      input {
        height: px2rem(30px);
        background: #f2f2f2;
        color: #394750;
        width: 80%;
        border-radius: 3px;
        text-indent: 1em;
      }
      &.title {
        flex: 0 0 120px;
      }
    }
  }
}
.popup {
  width: 100vw;
}
</style>
