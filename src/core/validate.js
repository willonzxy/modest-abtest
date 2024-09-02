export const checkLayerConfig = config => {
  const { hit, exp_set, layer_id, ref_exp_id, ref_exp_data } = config;
  if (!layer_id) {
    throw new Error(
      `ABTest配置错误，layer_id 字段不能为空，请检查配置是否正确`
    );
  }
  if (hit <= 0 || hit > 1) {
    throw new Error(
      `${layer_id}实验场景下的 hit 字段取值范围应该为 (0,1]，请检查配置是否正确`
    );
  }

  if ((hit + "").length > 4) {
    throw new Error(
      `${layer_id}实验场景下hit 字段取值范围应该为 (0,1]，且只能精确到小数点后两位，请检查配置是否正确`
    );
  }

  if (hit !== 1 && (typeof ref_exp_id === undefined || typeof ref_exp_data === undefined)) {
    throw new Error(
      `${layer_id}实验场景下 hit 字段取值不为1时，ref_exp_id和ref_exp_data字段不能为空，请检查配置是否正确`
    );
  }
  let expHit = 0;
  for (const exp of exp_set) {
    const { id, weight, data } = exp;
    if (!id || !weight || !data) {
      throw new Error(
        `${layer_id}实验场景下 exp_set 字段配置错误，实验id、weight、data字段不能为空，请检查配置是否正确`
      );
    }
    if ((weight + "").length > 4) {
      throw new Error(
        `${layer_id}实验场景下id为${id}权重取值范围应为[0,1]，且只能精确到小数点后两位，请检查配置是否正确`
      );
    }
    expHit += exp.weight;
  }
  expHit = +expHit.toFixed(2);
  if (expHit < 0 || expHit > 1) {
    throw new Error(
      `${layer_id}实验场景下的 exp_set 权重总和范围应为[0,1]，请检查配置是否正确`
    );
  }
  if (hit !== expHit) {
    throw new Error(
      `${layer_id}实验场景下流量分配错误，hit字段与exp_set权重总和不匹配，请检查配置是否正确`
    );
  }
};
