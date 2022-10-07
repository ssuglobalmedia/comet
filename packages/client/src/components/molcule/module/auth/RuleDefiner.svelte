<script lang="ts">
  import { Checkbox, Dropdown, FormGroup } from 'carbon-components-svelte';

  export let originalData: Array<Record<string, any>>;
  export let rule;

  $: dropdownItems = originalData
    ? [
        ...Object.keys(originalData[0])
          .filter((k) => k !== '__rowNum__')
          .map((k, idx) => ({
            id: idx,
            text: k,
          })),
      ]
    : [];
  let userIdCol = 0;
  let userNameCol = 0;
  let checkPhone = false;
  let checkCertificated = false;
  let checkLastSemester = false;
  let phoneCol = 0;

  function formValidation(): boolean {
    const set = new Set<number>();
    set.add(userIdCol);
    set.add(userNameCol);
    if (checkPhone) set.add(phoneCol);
    if (set.size < 2 + (checkPhone ? 1 : 0)) return false;
    return true;
  }

  $: {
    if (formValidation()) {
      rule = {
        userId: dropdownItems[userIdCol].text,
        userName: dropdownItems[userNameCol].text,
        checkCertificated,
        checkPhone,
        ...(checkPhone && { phone: dropdownItems[phoneCol].text }),
        checkLastSemester,
      };
    } else {
      rule = undefined;
    }
  }
</script>

<h4>규칙 설정</h4>
<p class="bx--data-table-header__description">검사할 데이터의 검사 규칙을 선택해 주세요.</p>
<div style="margin-top: 1.5rem">
  <FormGroup legendText="행 선택">
    <Dropdown
      titleText="학번"
      bind:selectedId={userIdCol}
      items={dropdownItems}
      invalid={userIdCol === userNameCol}
      invalidText="속성에 대해 선택한 행이 다른 속성과 겹칩니다." />
    <Dropdown
      titleText="사용자 이름"
      bind:selectedId={userNameCol}
      items={dropdownItems}
      invalid={userNameCol === userIdCol}
      invalidText="속성에 대해 선택한 행이 다른 속성과 겹칩니다." />
    <div style="display: flex; align-items: center;">
      <Checkbox
        style="flex: 0 1 auto; margin-right: 0.875rem;"
        labelText="전화번호 확인"
        hideLabel
        bind:checked={checkPhone} />
      <Dropdown
        style="flex: 1 0 auto;"
        titleText="전화번호"
        disabled={!checkPhone}
        bind:selectedId={phoneCol}
        items={dropdownItems}
        invalid={checkPhone && (phoneCol === userIdCol || phoneCol === userNameCol)}
        invalidText="속성에 대해 선택한 행이 다른 속성과 겹칩니다." />
    </div>
  </FormGroup>
  <FormGroup legendText="규칙 선택">
    <Checkbox labelText="납부자 여부 확인" bind:checked={checkCertificated} />
    <Checkbox labelText="재학 여부 확인" bind:checked={checkLastSemester} />
  </FormGroup>
</div>
