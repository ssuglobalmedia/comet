<script lang="ts">
  import { Checkbox, ComboBox, Dropdown, FormGroup } from "carbon-components-svelte";

  function shouldFilterItem(item, value) {
    if (!value) return true;
    return `${item.text}`.toLowerCase().includes(value.toLowerCase());
  }

  export let originalData: Array<Record<string, any>>;
  $: dropdownItems = originalData ? [
    ...Object.keys(originalData[0]).filter((k) => (k !== "__rowNum__")).map((k, idx) => ({
      id: idx, text: k
    }))] : [];
  let userIdCol = 0;
  let userNameCol = 0;
  let userGroupCol = 0;
  let includePhone = false;
  let phoneCol = 0;
  let includeLastSemester = false;
  let lastSemesterCol = 0;

  $: groupColValues = originalData ? [...originalData.reduce<Set<string>>((set, v) => {
    return set.add(v[dropdownItems[userGroupCol].text]);
  }, new Set<string>())] : [];
  $: groupComboBoxItems = [{
    id: groupColValues.length,
    text: "선택하지 않은 값"
  }, ...groupColValues.map((k, idx) => ({ id: idx, text: k }))];

  let groupEveryoneValue = "";
  let groupEveryoneIndex = -1;
  let groupCertificatedValue = "";
  let groupCertificatedIndex = -1;
  let groupExecutiveValue = "";
  let groupExecutiveIndex = -1;
  let groupAdminValue = "";
  let groupAdminIndex = -1;

  function formValidation(): boolean {
    const set = new Set<number>();
    set.add(userIdCol);
    set.add(userNameCol);
    set.add(userGroupCol);
    if (includePhone) set.add(phoneCol);
    if (includeLastSemester) set.add(lastSemesterCol);
    if (set.size < (3 + (includePhone ? 1 : 0) + (includeLastSemester ? 1 : 0))) return false;
    const valueSet = new Set<string>();
    let desiredSize = 0;
    let defaultSet = false;
    if (groupEveryoneValue.length) {
      valueSet.add(groupEveryoneValue);
      desiredSize += 1;
      if (groupComboBoxItems[groupEveryoneIndex].id === groupColValues.length) defaultSet = true;
    }
    if (groupCertificatedValue.length) {
      valueSet.add(groupCertificatedValue);
      desiredSize += 1;
      if (groupComboBoxItems[groupCertificatedIndex].id === groupColValues.length) defaultSet = true;
    }
    if (groupExecutiveValue.length) {
      valueSet.add(groupExecutiveValue);
      desiredSize += 1;
      if (groupComboBoxItems[groupExecutiveIndex].id === groupColValues.length) defaultSet = true;
    }
    if (groupAdminValue.length) {
      valueSet.add(groupAdminValue);
      desiredSize += 1;
      if (groupComboBoxItems[groupAdminIndex].id === groupColValues.length) defaultSet = true;
    }
    if (desiredSize < groupColValues.length && !defaultSet) return false;
    return valueSet.size === desiredSize;
  }

  export let conversion;
  $: {
    if (formValidation()) {
      conversion = {
        userId: dropdownItems[userIdCol].text,
        userName: dropdownItems[userNameCol].text,
        userGroup: dropdownItems[userGroupCol].text,
        userGroupConv: {
          everyone: {
            defaults: (groupEveryoneIndex > -1 && groupComboBoxItems[groupEveryoneIndex].id === groupColValues.length),
            keyword: groupEveryoneValue ? groupEveryoneValue : undefined
          },
          certificated: {
            defaults: (groupCertificatedIndex > -1 && groupComboBoxItems[groupCertificatedIndex].id === groupColValues.length),
            keyword: groupCertificatedValue ? groupCertificatedValue : undefined
          },
          executive: {
            defaults: (groupExecutiveIndex > -1 && groupComboBoxItems[groupExecutiveIndex].id === groupColValues.length),
            keyword: groupExecutiveValue ? groupExecutiveValue : undefined
          },
          admin: {
            defaults: (groupAdminIndex > -1 && groupComboBoxItems[groupAdminIndex].id === groupColValues.length),
            keyword: groupAdminValue ? groupAdminValue : undefined
          }
        },
        ...(includeLastSemester && { lastSemester: lastSemesterCol >= dropdownItems.length ? ":latest" : dropdownItems[lastSemesterCol].text }),
        ...(includePhone && { phone: dropdownItems[phoneCol].text })
      };
    } else {
      conversion = undefined;
    }
  }
</script>

<h4>데이터 변환</h4>
<p class="bx--data-table-header__description">열람한 데이터를 형식에 맞게 변환해 주세요.<br>COMET 사용자 데이터의 행 제목과 업로드한 데이터의 행 제목을 일치시켜 주고,
  해당 데이터셋에 존재하는 정보는 체크해 주세요.</p>
<div style="margin-top: 1.5rem">
  <FormGroup legendText="행 선택">
    <Dropdown
      titleText="학번"
      bind:selectedId={userIdCol}
      items={dropdownItems}
      invalid={userIdCol === userNameCol || userIdCol === userGroupCol || (includePhone && userIdCol === phoneCol) || (includeLastSemester && userIdCol === lastSemesterCol)}
      invalidText="속성에 대해 선택한 행이 다른 속성과 겹칩니다."
    />
    <Dropdown
      titleText="사용자 이름"
      bind:selectedId={userNameCol}
      items={dropdownItems}
      invalid={userNameCol === userIdCol || userNameCol === userGroupCol || (includePhone && userNameCol === phoneCol) || (includeLastSemester && userNameCol === lastSemesterCol)}
      invalidText="속성에 대해 선택한 행이 다른 속성과 겹칩니다."
    />
    <Dropdown
      titleText="구분"
      bind:selectedId={userGroupCol}
      items={dropdownItems}
      invalid={userGroupCol === userIdCol || userGroupCol === userNameCol || (includePhone && userGroupCol === phoneCol) || (includeLastSemester && userGroupCol === lastSemesterCol)}
      invalidText="속성에 대해 선택한 행이 다른 속성과 겹칩니다."
      warn={groupColValues.length > 5}
      warnText="선택한 열에 존재하는 값의 종류가 COMET의 권한 개수(5)를 넘습니다. 올바른 행을 선택했는지 확인하세요."
    />
    <div style="display: block">
      <div style="display: flex; align-items: center;">
        <Checkbox style="flex: 0 1 auto; margin-right: 0.875rem;" labelText="전화번호 포함" hideLabel
                  bind:checked={includePhone} />
        <Dropdown
          style="flex: 1 0 auto;"
          titleText="전화번호"
          disabled={!includePhone}
          bind:selectedId={phoneCol}
          items={dropdownItems}
          invalid={includePhone && (phoneCol === userIdCol || phoneCol === userNameCol || phoneCol === userGroupCol || (includeLastSemester && phoneCol === lastSemesterCol))}
          invalidText="속성에 대해 선택한 행이 다른 속성과 겹칩니다."
        />
      </div>
      <div style="display: flex; align-items: center;">
        <Checkbox style="flex: 0 1 auto; margin-right: 0.875rem;" labelText="마지막 재학 학기 포함" hideLabel
                  bind:checked={includeLastSemester} />
        <Dropdown
          style="flex: 1 0 auto;"
          titleText="마지막 재학 학기"
          disabled={!includeLastSemester}
          bind:selectedId={lastSemesterCol}
          items={[...dropdownItems, { id: dropdownItems.length, text: "현재 학기로 채우기"}]}
          invalid={includeLastSemester && (lastSemesterCol === userIdCol || lastSemesterCol === userNameCol || lastSemesterCol === userGroupCol || (includePhone && lastSemesterCol === phoneCol))}
          invalidText="속성에 대해 선택한 행이 다른 속성과 겹칩니다."
        />
      </div>
      <p class="bx--label">해당 속성의 값은 년도-학기를 숫자로 표현한 값이여야 합니다. 예) 2022-1</p>
    </div>
  </FormGroup>
  <FormGroup legendText="변환 선택">
    <p class="bx--label">사용자 구분의 변환 결과를 선택합니다.</p>
    <p>선택된 행: {dropdownItems[userGroupCol].text}</p>
    <ComboBox
      titleText="학부생"
      placeholder="해당 권한을 줄 값을 선택...(선택하지 않으면 해당 권한을 부여하지 않음)"
      items={groupComboBoxItems}
      bind:value={groupEveryoneValue}
      bind:selectedId={groupEveryoneIndex}
      invalid={groupEveryoneValue.length > 0 && (groupEveryoneValue === groupCertificatedValue || groupEveryoneValue === groupExecutiveValue || groupEveryoneValue === groupAdminValue)}
      invalidText="다른 권한에 동일한 값을 선택할 수 없습니다."
      {shouldFilterItem}
    />
    <ComboBox
      titleText="학부생 (납부자)"
      placeholder="해당 권한을 줄 값을 선택...(선택하지 않으면 해당 권한을 부여하지 않음)"
      items={groupComboBoxItems}
      bind:value={groupCertificatedValue}
      bind:selectedId={groupCertificatedIndex}
      invalid={groupCertificatedValue.length > 0 && (groupCertificatedValue === groupEveryoneValue || groupCertificatedValue === groupExecutiveValue || groupCertificatedValue === groupAdminValue)}
      invalidText="다른 권한에 동일한 값을 선택할 수 없습니다."
      {shouldFilterItem}
    />
    <ComboBox
      titleText="집행부원"
      placeholder="해당 권한을 줄 값을 선택...(선택하지 않으면 해당 권한을 부여하지 않음)"
      items={groupComboBoxItems}
      bind:value={groupExecutiveValue}
      bind:selectedId={groupExecutiveIndex}
      invalid={groupExecutiveValue.length > 0 && (groupExecutiveValue === groupEveryoneValue || groupExecutiveValue === groupCertificatedValue || groupExecutiveValue === groupAdminValue)}
      invalidText="다른 권한에 동일한 값을 선택할 수 없습니다."
      {shouldFilterItem}
    />
    <ComboBox
      titleText="관리자"
      placeholder="해당 권한을 줄 값을 선택...(선택하지 않으면 해당 권한을 부여하지 않음)"
      items={groupComboBoxItems}
      bind:value={groupAdminValue}
      bind:selectedId={groupAdminIndex}
      invalid={groupAdminValue.length > 0 && (groupAdminValue === groupEveryoneValue || groupAdminIndex === groupCertificatedValue || groupAdminValue === groupExecutiveValue)}
      invalidText="다른 권한에 동일한 값을 선택할 수 없습니다."
      {shouldFilterItem}
    />
  </FormGroup>
</div>