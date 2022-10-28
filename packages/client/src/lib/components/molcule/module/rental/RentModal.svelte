<script lang="ts">
  import {
    Button,
    ComposedModal,
    DatePicker,
    DatePickerInput,
    FormGroup,
    InlineLoading,
    ModalBody,
    ModalFooter,
    ModalHeader,
    MultiSelect,
    Select,
    SelectItem,
    TextInput,
  } from 'carbon-components-svelte';
  import { groupDisplayName, isAccessible } from '$lib/module/auth';
  import type { Goods, User } from '@types/mirinae-comet';
  import { createEventDispatcher } from 'svelte';
  import { apiGoodsRent } from '$lib/api/module/rental';
  import { apiUserQuery } from '$lib/api/module/auth';

  export let open = false;

  export let goodies: Array<Goods> = [];

  export let reqStatus: 'pending' | 'active' | 'finished' | 'error' = 'pending';

  const dispatch = createEventDispatcher();

  function getISOLocalString() {
    let date = new Date();
    let tzo = -date.getTimezoneOffset();

    if (tzo === 0) {
      return date.toISOString();
    } else {
      let dif = tzo >= 0 ? '+' : '-';
      let pad = function (num, digits = 2) {
        return String(num).padStart(digits, '0');
      };

      return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes()) +
        ':' +
        pad(date.getSeconds()) +
        dif +
        pad(tzo / 60) +
        ':' +
        pad(tzo % 60) +
        '.' +
        pad(date.getMilliseconds(), 3)
      );
    }
  }

  let userReqStatus: 'pending' | 'active' | 'finished' | 'error' = 'pending';
  let selectableGoodies = [];
  let userId;
  let user: User;
  let date = getISOLocalString().slice(0, 10);
  let time = 12;
  let selectedGoodies = [];
  let additionalInfo = '';

  $: isoDate = `${date}T${time}:00:00.000`;

  $: if (user) {
    selectableGoodies = (goodies ?? [])
      .filter((goods) => goods.rentStatus === undefined && isAccessible(user, goods.permission))
      .map((goods) => ({
        id: goods.id,
        text: goods.name,
      }));
  }

  $: if (open) {
    reqStatus = 'pending';
  }

  $: if (userId !== undefined && userId !== user?.userId) {
    userReqStatus = 'pending';
  }

  function doRent() {
    reqStatus = 'active';
    const requests = selectedGoodies.map((id) => {
      return new Promise((resolve, reject) => {
        apiGoodsRent({
          user,
          goodsId: id,
          until: new Date(isoDate).toISOString(),
          additionalInfo,
        })
          .then((res) => {
            if (res.success === false) {
              reject();
              return;
            }
            resolve();
            setTimeout(() => (open = false), 500);
          })
          .catch((err) => {
            reject();
            console.error(err);
          });
      });
    });
    Promise.all(requests)
      .then(() => {
        reqStatus = 'finished';
        dispatch('success', {});
      })
      .catch(() => {
        reqStatus = 'error';
      });
  }

  function queryUser() {
    userReqStatus = 'active';
    apiUserQuery(userId)
      .then((res) => {
        if (!res.success || (res.result).length == 0) {
          userReqStatus = 'error';
          return;
        }
        user = res.result[0];
        userReqStatus = 'finished';
      })
      .catch((err) => {
        userReqStatus = 'error';
        console.error(err);
      });
  }
</script>

<ComposedModal bind:open on:submit={doRent} {...$$restProps}>
  <ModalHeader label="대여" title="물품 대여" />
  <ModalBody hasForm>
    <FormGroup legendText="사용자">
      <TextInput labelText="학번" placeholder="학번을 입력하세요..." bind:value={userId} />
      <Button kind="secondary" disabled={userReqStatus !== 'pending'} on:click={queryUser}>
        {#if userReqStatus === 'pending'}
          조회
        {:else if userReqStatus === 'active'}
          <InlineLoading status="active" description="불러오는 중입니다..." />
        {:else if userReqStatus === 'finished'}
          <InlineLoading
            status="finished"
            description="사용자 {user.userName}님을 찾았습니다. / {groupDisplayName[
              user.userGroup
            ]}" />
        {:else if userReqStatus === 'error'}
          <InlineLoading status="error" description="오류 발생" />
        {/if}
      </Button>
    </FormGroup>
    <MultiSelect
      titleText="대여할 물품 선택"
      filterable
      label="대여할 물품을 검색하여 선택하세요..."
      helperText="지정된 사용자가 이용할 수 있는 대여 물품만 표시됩니다."
      items={selectableGoodies}
      bind:selectedIds={selectedGoodies} />
    <FormGroup style="margin-top: 1rem;" legendText="예상 반납 일시">
      <DatePicker datePickerType="single" dateFormat="Y-m-d" locale="ko" bind:value={date}>
        <DatePickerInput labelText="일" placeholder="yyyy-mm-dd" />
      </DatePicker>
      <Select labelText="시" bind:selected={time}>
        <SelectItem value={12} text="오후 12시" />
        <SelectItem value={13} text="오후 1시" />
        <SelectItem value={14} text="오후 2시" />
        <SelectItem value={15} text="오후 3시" />
        <SelectItem value={16} text="오후 4시" />
        <SelectItem value={17} text="오후 6시" />
      </Select>
    </FormGroup>
    <TextInput
      labelText="비고(보증 물품)"
      placeholder="학생증, 민증 등 특이사항 입력..."
      bind:value={additionalInfo} />
  </ModalBody>
  <div
    style="display: flex; justify-content: end; padding-left: 0.825rem; padding-right: 0.825rem;">
    <div>
      {#if reqStatus === 'active'}
        <InlineLoading description="업데이트 중..." />
      {:else if reqStatus === 'finished'}
        <InlineLoading status="finished" description="새로고침 하면 정보가 반영됩니다." />
      {:else if reqStatus === 'error'}
        <InlineLoading status="error" description="오류 발생" />
      {/if}
    </div>
  </div>
  <ModalFooter
    primaryButtonDisabled={!user || selectedGoodies.length <= 0 || reqStatus !== 'pending'}
    primaryButtonText="대여" />
</ComposedModal>
